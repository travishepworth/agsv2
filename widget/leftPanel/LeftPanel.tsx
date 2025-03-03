import { App } from "astal/gtk3";
import { Variable, bind } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk3";
import TextInput from "./modules/textBox";
import ChatGPTDisplay from "./modules/chatGPT";
import { fetchYandereResponse, fetchChatGPTResponse } from "./modules/api";
import APISwitcher from "./modules/apiSwitcher";
import BooruDisplay from "./modules/booru";

export const chatHistory = Variable<{ role: string; content: string }[]>([]);

export default function LeftPanel(monitor: Gdk.Monitor) {
  const { CENTER } = Gtk.Align;
  const isVisible = Variable<boolean>(false);

  // Calculate the width of the panel (e.g., half the screen width, adjustable)
  const panelWidth = Variable(20); // Default width, adjustable as needed
  const barHeight = 42;
  const offset = 6;
  const promptText = Variable<string>("");
  const booruResponse = Variable<string[]>(["Waiting for image..."]);
  const selectedAPI = Variable<"chatGPT" | "booru">("chatGPT");

  const handleTextSubmit = async (text: string) => {
    promptText.set(text);
    if (selectedAPI.get() === "chatGPT") {
      chatHistory.set([...chatHistory.get(), { role: "user", content: text }]);
      const response = await fetchChatGPTResponse(text);
      chatHistory.set([
        ...chatHistory.get(),
        { role: "assistant", content: response },
      ]);
    } else {
      const response = await fetchYandereResponse(text);
      booruResponse.set(response);
    }
  };

  const clearChatHistory = () => chatHistory.set([]);

  return (
    <window
      name="leftPanel"
      className="LeftPanel"
      visible={bind(isVisible)}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      marginTop={barHeight + offset}
      marginBottom={offset}
      marginLeft={offset}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      application={App}
      onKeyPressEvent={(self, event: Gdk.Event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();
      }}
    >
      <box>
        <eventbox expand onClick={() => isVisible.set(false)} />{" "}
        {/* Click outside to hide */}
        <box hexpand={true} vertical>
          <box halign={CENTER} marginTop={10}>
            <APISwitcher
              selected={selectedAPI}
              onSelect={(option) => selectedAPI.set(option)}
            />
          </box>
          {bind(selectedAPI).as((api) =>
            api === "chatGPT" ? (
              <box vertical>
                <ChatGPTDisplay history={chatHistory} />
                <button
                  label="Clear Chat"
                  halign={CENTER}
                  onClick={clearChatHistory}
                />
              </box>
            ) : (
              <box vertical>
                <BooruDisplay response={booruResponse} />
              </box>
            ),
          )}
          <eventbox hexpand={true} vexpand={false}>
            <box halign={CENTER} valign={Gtk.Align.END}>
              <TextInput onSubmit={handleTextSubmit} />
            </box>
          </eventbox>
        </box>
      </box>
    </window>
  );
}
