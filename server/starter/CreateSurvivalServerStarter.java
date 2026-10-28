import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.io.Writer;
import java.lang.management.ManagementFactory;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * The CreateSurvival Lite server's jar (set as the host's server jar): brings the server up to date with the published
 * pack, then starts NeoForge.
 * <ol>
 * <li>Settings from createsurvival-server.properties (written with the defaults on the first start): packUrl, keep.</li>
 * <li>First start (no packwiz.json yet): the old mods folder is moved to mods-before-sync-*, so only the pack's mods are
 * left (packwiz only ever removes files it installed itself).</li>
 * <li>packwiz-installer (server side: client-only mods and resource packs left out) updates mods, config, kubejs, ...
 * The files and folders in keep are the server's own (Distant Horizons and Chunksmith are set up differently for the
 * server than for players): put back as they were afterwards.</li>
 * <li>The pack's NeoForge version, installed with NeoForge's installer if it isn't yet.</li>
 * <li>The server, with this JVM's options (the host's memory settings): its console and stop go straight through.</li>
 * </ol>
 * If the update fails (GitHub down), the server starts with what it has.
 */
public final class CreateSurvivalServerStarter {
    private static final String SETTINGS = "createsurvival-server.properties";
    private static final String DEFAULT_PACK = "https://raw.githubusercontent.com/Rodistoo/createsurvival-lite/main/pack/pack.toml";
    private static final String DEFAULT_KEEP = "config/DistantHorizons.toml,config/chunksmith,config/chunksmith-lod.properties,server.properties";
    private static final String BOOTSTRAP = "packwiz-installer-bootstrap.jar";
    private static final String BOOTSTRAP_URL = "https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar";
    private static final Path KEPT = Path.of(".createsurvival-kept");

    private static final HttpClient HTTP = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).connectTimeout(Duration.ofSeconds(20)).build();
    private static final String JAVA = Path.of(System.getProperty("java.home"), "bin", "java").toString();

    public static void main(String[] args) throws Exception {
        Properties settings = settings();
        String packUrl = settings.getProperty("packUrl", DEFAULT_PACK).trim();
        List<String> keep = new ArrayList<>();
        for (String entry : settings.getProperty("keep", "").split(",")) {
            if (!entry.isBlank()) {
                keep.add(entry.trim());
            }
        }

        String packToml = null;
        try {
            packToml = get(packUrl);
            update(packUrl, keep);
        } catch (Exception e) {
            log("pack update failed, starting with the files there are: " + e);
        }

        String neoforge = neoforgeVersion(packToml);
        if (neoforge == null) {
            log("no NeoForge found (libraries/net/neoforged/neoforge) and the pack couldn't be read");
            System.exit(1);
        }
        Path argsFile = Path.of("libraries", "net", "neoforged", "neoforge", neoforge,
                System.getProperty("os.name").toLowerCase().contains("win") ? "win_args.txt" : "unix_args.txt");
        if (!Files.exists(argsFile)) {
            installNeoForge(neoforge);
        }
        System.exit(runServer(argsFile, args));
    }

    // settings -----------------------------------------------------------------------------------------------------

    private static Properties settings() throws IOException {
        Path file = Path.of(SETTINGS);
        Properties settings = new Properties();
        if (Files.exists(file)) {
            try (Reader in = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                settings.load(in);
            }
            return settings;
        }
        settings.setProperty("packUrl", DEFAULT_PACK);
        settings.setProperty("keep", DEFAULT_KEEP);
        try (Writer out = Files.newBufferedWriter(file, StandardCharsets.UTF_8)) {
            settings.store(out, " CreateSurvival server starter. packUrl: the pack the server follows. keep: files/folders (comma-separated)"
                    + " the server keeps as they are here, whatever the pack has.");
        }
        log("wrote " + SETTINGS + " with the defaults");
        return settings;
    }

    // updating -----------------------------------------------------------------------------------------------------

    private static void update(String packUrl, List<String> keep) throws Exception {
        if (!Files.exists(Path.of("packwiz.json")) && Files.isDirectory(Path.of("mods"))) {
            Path old = Path.of("mods-before-sync-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")));
            Files.move(Path.of("mods"), old);
            log("first update: the old mods are in " + old + " now");
        }
        if (!Files.exists(Path.of(BOOTSTRAP))) {
            log("downloading " + BOOTSTRAP);
            download(BOOTSTRAP_URL, Path.of(BOOTSTRAP));
        }
        deleteTree(KEPT);
        for (String entry : keep) {
            Path path = Path.of(entry);
            if (Files.exists(path)) {
                copyTree(path, KEPT.resolve(entry));
            }
        }
        log("updating from " + packUrl);
        Process installer = new ProcessBuilder(JAVA, "-jar", BOOTSTRAP, "-g", "-s", "server", packUrl).inheritIO().start();
        boolean done = installer.waitFor(20, TimeUnit.MINUTES);
        if (!done) {
            installer.destroyForcibly();
        }
        // what was kept goes back, also when the update failed half way
        for (String entry : keep) {
            Path saved = KEPT.resolve(entry);
            if (Files.exists(saved)) {
                deleteTree(Path.of(entry));
                copyTree(saved, Path.of(entry));
            }
        }
        deleteTree(KEPT);
        if (!done || installer.exitValue() != 0) {
            throw new IOException("packwiz-installer " + (done ? "exited with " + installer.exitValue() : "took too long"));
        }
        log("up to date");
    }

    /** The pack's NeoForge version, else the newest installed one, else null. */
    private static String neoforgeVersion(String packToml) throws IOException {
        if (packToml != null) {
            Matcher m = Pattern.compile("(?m)^\\s*neoforge\\s*=\\s*\"([^\"]+)\"").matcher(packToml);
            if (m.find()) {
                return m.group(1);
            }
        }
        Path installed = Path.of("libraries", "net", "neoforged", "neoforge");
        if (!Files.isDirectory(installed)) {
            return null;
        }
        try (Stream<Path> versions = Files.list(installed)) {
            return versions.map(p -> p.getFileName().toString()).max(Comparator.comparing(CreateSurvivalServerStarter::versionKey)).orElse(null);
        }
    }

    private static String versionKey(String version) {
        StringBuilder key = new StringBuilder();
        for (String part : version.split("[^0-9]+")) {
            if (!part.isEmpty()) {
                key.append(String.format("%08d", Long.parseLong(part)));
            }
        }
        return key.toString();
    }

    private static void installNeoForge(String version) throws Exception {
        Path installer = Path.of("neoforge-" + version + "-installer.jar");
        log("installing NeoForge " + version);
        download("https://maven.neoforged.net/releases/net/neoforged/neoforge/" + version + "/neoforge-" + version + "-installer.jar", installer);
        int exit = new ProcessBuilder(JAVA, "-jar", installer.toString(), "--installServer").inheritIO().start().waitFor();
        Files.deleteIfExists(installer);
        Files.deleteIfExists(Path.of(installer + ".log"));
        if (exit != 0) {
            throw new IOException("NeoForge installer exited with " + exit);
        }
    }

    // the server ---------------------------------------------------------------------------------------------------

    private static int runServer(Path argsFile, String[] args) throws Exception {
        List<String> command = new ArrayList<>();
        command.add(JAVA);
        command.addAll(ManagementFactory.getRuntimeMXBean().getInputArguments());
        command.add("@" + argsFile);
        boolean nogui = false;
        for (String arg : args) {
            command.add(arg);
            nogui |= arg.equalsIgnoreCase("nogui") || arg.equalsIgnoreCase("--nogui");
        }
        if (!nogui) {
            command.add("nogui");
        }
        log("starting the server: " + String.join(" ", command));
        Process server = new ProcessBuilder(command).inheritIO().start();
        // the host stopping this process (not by the console's stop): the server saves and stops too
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            if (server.isAlive()) {
                server.destroy();
                try {
                    server.waitFor(90, TimeUnit.SECONDS);
                } catch (InterruptedException ignored) {
                }
            }
        }));
        return server.waitFor();
    }

    // files --------------------------------------------------------------------------------------------------------

    private static String get(String url) throws Exception {
        HttpResponse<String> response = HTTP.send(HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(30)).build(),
                HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IOException(url + ": HTTP " + response.statusCode());
        }
        return response.body();
    }

    private static void download(String url, Path to) throws Exception {
        HttpResponse<InputStream> response = HTTP.send(HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofMinutes(5)).build(),
                HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() != 200) {
            throw new IOException(url + ": HTTP " + response.statusCode());
        }
        Path part = Path.of(to + ".part");
        try (InputStream in = response.body()) {
            Files.copy(in, part, StandardCopyOption.REPLACE_EXISTING);
        }
        Files.move(part, to, StandardCopyOption.REPLACE_EXISTING);
    }

    private static void copyTree(Path from, Path to) throws IOException {
        to = to.toAbsolutePath();
        try (Stream<Path> all = Files.walk(from)) {
            for (Path p : (Iterable<Path>) all::iterator) {
                Path target = to.resolve(from.relativize(p).toString());
                if (Files.isDirectory(p)) {
                    Files.createDirectories(target);
                } else {
                    Files.createDirectories(target.getParent());
                    Files.copy(p, target, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
    }

    private static void deleteTree(Path path) throws IOException {
        if (!Files.exists(path)) {
            return;
        }
        try (Stream<Path> all = Files.walk(path)) {
            for (Path p : (Iterable<Path>) all.sorted(Comparator.reverseOrder())::iterator) {
                Files.delete(p);
            }
        }
    }

    private static void log(String message) {
        System.out.println("[CreateSurvival starter] " + message);
    }

    private CreateSurvivalServerStarter() {}
}
