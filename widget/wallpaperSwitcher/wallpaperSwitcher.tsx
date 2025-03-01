import { App, Astal, Gtk, Gdk } from "astal/gtk3";
import { GLib, Gio, Variable, bind, exec, execAsync } from "astal";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";

const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags/thumbnails`;
const WALLPAPER_DIR = "/home/travis/Pictures/wallpapers";

function hide() {
  App.get_window("wallpaper")!.hide();
}

function set_wallpaper(wallpaper: string) {
  const transitions = ["wipe", "any", "outer", "wave"];
  const transition = transitions[Math.floor(Math.random() * transitions.length)];
  const fps = 144;
  const duration = 1;
  const swwwParams: string = `--transition-fps ${fps} --transition-type ${transition} --transition-duration ${duration}`;

  const currentMonitor = exec(["bash", "-c", `hyprctl -j activeworkspace | jq .monitor | tr -d '"'`]);

  execAsync(["bash", "-c", `swww img -o ${currentMonitor} ${wallpaper} ${swwwParams}`])
    .then(() => { console.log(`Set wallpaper to ${wallpaper}`); })
    .catch((error) => { console.error(`Failed to set wallpaper: ${error}`); });

  if (currentMonitor === "DP-1") {
    execAsync(["bash", "-c", `rm /home/travis/.current_wallpaper && ln -s ${wallpaper} /home/travis/.current_wallpaper`]);
  }
}

function ensureCacheDir() {
  const cacheDir = Gio.File.new_for_path(CACHE_DIR);
  if (!cacheDir.query_exists(null)) {
    cacheDir.make_directory_with_parents(null);
  }
}

function getThumbnailPath(wallpaper: string): string {
  const filename = wallpaper.split("/").pop()!.replace(/[^a-zA-Z0-9.]/g, "_");
  return `${CACHE_DIR}/${filename}`;
}

function generateThumbnails(wallpaper: string, thumbnailPath: string): string {
  let pixbuf: GdkPixbuf.Pixbuf;
  try {
    pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(wallpaper, 150, 100, true);
  } catch (error) {
    console.log(`Failed to load ${wallpaper}: ${error}`);
    pixbuf = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, 150, 100);
  }

  try {
    pixbuf.savev(thumbnailPath, "png", [], []);
  } catch (error) {
    console.error(`Failed to save thumbnail for ${wallpaper}: ${error}`);
  }
  return thumbnailPath;
}

function WallPaperButton({ wallpaper }: { wallpaper: string }) {
  const wallpaperTitle = wallpaper.split("/").pop()?.split(".")[0] || "Wallpaper";

  ensureCacheDir();
  const thumbnailPath = getThumbnailPath(wallpaper);

  const thumbnailFile = Gio.File.new_for_path(thumbnailPath);
  if (!thumbnailFile.query_exists(null)) {
    console.log(`Generating thumbnail for ${wallpaper}`);
    generateThumbnails(wallpaper, thumbnailPath);
  }

  return (
    <button
      className="WallPaperButton"
      onClicked={() => {
        set_wallpaper(wallpaper);
        hide();
      }}
      heightRequest={120}
      vexpand={false}
    >
      <box vertical vexpand={false} spacing={0}>
        <box
          valign={Gtk.Align.START}
          vexpand={false}
          className="title-container"
          heightRequest={20}
        >
          <label
            className="name"
            truncate
            xalign={0}
            label={wallpaperTitle}
            maxWidthChars={15}
          />
        </box>
        <box
          valign={Gtk.Align.CENTER}
          vexpand={false}
          className="preview-box"
          heightRequest={100}
          css={`
            background-image: url("${thumbnailPath}");
            background-size: cover;
            background-position: center;
            min-height: 100px;
            min-width: 150px;
          `}
        />
      </box>
    </button>
  );
}

function getWallpapersInDirectory(directory: string): string[] {
  try {
    const files = Gio.File.new_for_path(directory).enumerate_children(
      "standard::*",
      Gio.FileQueryInfoFlags.NONE,
      null
    );

    const wallpaperFiles: string[] = [];
    let file: Gio.FileInfo | null;
    while ((file = files.next_file(null))) {
      if (file.get_file_type() === Gio.FileType.REGULAR) {
        wallpaperFiles.push(directory + "/" + file.get_name());
      }
    }
    wallpaperFiles.sort((a, b) => {
      const aName = a.split("/").pop()!.toLowerCase();
      const bName = b.split("/").pop()!.toLowerCase();
      return aName.localeCompare(bName);
    });
    console.log(`Found ${wallpaperFiles.length} wallpapers in ${directory}`);
    return wallpaperFiles;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export default function WallpaperSwitcher() {
  const search = Variable<string>("");
  const wallpapers = Variable<string[]>(getWallpapersInDirectory(WALLPAPER_DIR));
  const filteredWallpapers = Variable<string[]>(wallpapers.get());

  // Update filteredWallpapers when either wallpapers or search changes
  wallpapers.subscribe((newWallpapers) => {
    filteredWallpapers.set(
      newWallpapers.filter((wallpaper) =>
        wallpaper
          .split("/")
          .pop()!
          .toLowerCase()
          .includes(search.get().toLowerCase())
      )
    );
  });
  search.subscribe((newQuery) => {
    filteredWallpapers.set(
      wallpapers.get().filter((wallpaper) =>
        wallpaper
          .split("/")
          .pop()!
          .toLowerCase()
          .includes(newQuery.toLowerCase())
      )
    );
  });

  return (
    <window
      name="wallpaper"
      application={App}
      keymode={Astal.Keymode.EXCLUSIVE}
      visible={false}
      onShow={() => {
        wallpapers.set(getWallpapersInDirectory(WALLPAPER_DIR));
      }}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          hide();
        }
      }}
    >
      <box
        className="wallpaper-switcher"
        widthRequest={590}
        heightRequest={575}
        vexpand={false}
        hexpand={false}
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        vertical
      >
        <entry
          placeholderText=" Search"
          text={bind(search)}
          onChanged={(self) => search.set(self.text ?? "")}
          widthRequest={450}
          hexpand
          onMap={(self) => {
            self.grab_focus();
          }}
        />
        <scrollable
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
          heightRequest={480}
          widthRequest={485}
          className="wallpaper-scrollable"
        >
          <box
            spacing={10}
            halign={Gtk.Align.CENTER}
          >
            {bind(filteredWallpapers).as((wallpaperList) => {

              const column1 = [];
              const column2 = [];
              const column3 = [];
              for (let i = 0; i < wallpaperList.length; i++) {
                if (i % 3 === 0) column1.push(wallpaperList[i]);
                else if (i % 3 === 1) column2.push(wallpaperList[i]);
                else column3.push(wallpaperList[i]);
              }

              return [
                <box vertical spacing={6} className="wallpaper-column" widthRequest={150}>
                  {column1.map((wallpaper) => (
                    <WallPaperButton wallpaper={wallpaper} />
                  ))}
                </box>,
                <box vertical spacing={6} className="wallpaper-column" widthRequest={150}>
                  {column2.map((wallpaper) => (
                    <WallPaperButton wallpaper={wallpaper} />
                  ))}
                </box>,
                <box vertical spacing={6} className="wallpaper-column" widthRequest={150}>
                  {column3.map((wallpaper) => (
                    <WallPaperButton wallpaper={wallpaper} />
                  ))}
                </box>,
              ];
            })}
          </box>
        </scrollable>
      </box>
    </window>
  );
}
