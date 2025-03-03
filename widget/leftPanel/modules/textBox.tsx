import { Gtk } from "astal/gtk3";

export default function TextInput({
  onSubmit,
}: {
  onSubmit: (text: string) => void;
}) {
  const handleSubmit = (text: string, entry?: Gtk.Entry) => {
    onSubmit(text);
    if (entry) entry.text = ""; // Clear the text after submission
  };

  return (
    <box className="TextInput" vertical={false} spacing={10}>
      <entry
        widthRequest={500}
        placeholderText="Type here..."
        onActivate={(self) => handleSubmit(self.text, self)} // Enter keypress
        onChanged={(self) => self.text} // Update text as typed (optional)
        onShow={(self) => self.grab_focus()} // Focus the entry on show
      />
      <button
        onClicked={(self) => {
          const parent = self.get_parent() as Gtk.Box; // Cast to Gtk.Box
          const entry = parent.get_children()[0] as Gtk.Entry; // Get the first child (entry)
          if (entry) handleSubmit(entry.text, entry);
        }}
      >
        <label label="" />
      </button>
    </box>
  );
}
