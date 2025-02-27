import { Variable, bind, execAsync } from "astal";

export default function Logo() {
  // State to track if the logo is clicked (optional, for future expansion)
  const isClicked = Variable<boolean>(false);

  // Function to handle logo click (placeholder for now)
  const launchPowerMenu = () => {
    console.log("Power menu launched!"); // Placeholder—replace with power menu logic later
    // Example: execAsync(["bash", "-c", "echo 'Launching power menu'"]); // Dummy command
    isClicked.set(true); // Optional: update state for reactivity
  };

  return (
    <box className="Logo">
      <button
        onClicked={launchPowerMenu}
        label="󰣇" // Nerd Font logo/icon (e.g., Arch Linux logo, or customize as needed)
      />
    </box>
  );
}
