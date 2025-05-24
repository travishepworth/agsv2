import { App } from "astal/gtk3";
import { Variable, bind } from "astal";
import { Astal, Gtk, Gdk } from "astal/gtk3";

// Utility function to get days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Utility function to get the first day of the month (0 = Sunday, 6 = Saturday)
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const currentDate = Variable(new Date());
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Function to render the calendar grid
  function renderCalendar() {
    const year = currentDate.get().getFullYear();
    const month = currentDate.get().getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const dayLabels: JSX.Element[] = [];
    let day = 1;

    // Add empty boxes for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      dayLabels.push(<box className="calendar-day empty" />);
    }

    // Add day numbers
    for (let i = day; i <= daysInMonth; i++) {
      const isToday =
        i === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();
      dayLabels.push(
        <label
          className={`calendar-day ${isToday ? "today" : ""}`}
          label={String(i)}
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        />,
      );
    }

    return dayLabels;
  }

  // Functions to change the month
  const prevMonth = () => {
    const newDate = new Date(currentDate.get());
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.set(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.get());
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.set(newDate);
  };

  return (
    <box
      className="CalendarWidget"
      vertical
      spacing={10}
      halign={Gtk.Align.CENTER}
    >
      {/* Header with month/year and navigation */}
      <box halign={Gtk.Align.CENTER} spacing={10}>
        <button label="Prev" onClick={prevMonth} />
        <label
          label={currentDate.get().toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
          halign={Gtk.Align.CENTER}
        />
        <button label="Next" onClick={nextMonth} />
      </box>

      {/* Weekday headers */}
      <box className="calendar-grid" halign={Gtk.Align.CENTER}>
        {weekdays.map((day) => (
          <label
            className="calendar-weekday"
            label={day}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
          />
        ))}
      </box>

      {/* Calendar days */}
      <box className="calendar-grid" halign={Gtk.Align.CENTER}>
        {
          renderCalendar()
        }
      </box>
    </box>
  );
}
