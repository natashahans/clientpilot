export type ChartRange = "24h" | "7days" | "30days" | "90days";

export type ChartPoint = {
  label: string;
  bookings: number;
  revenue: number;
};

export type ChartAppointment = {
  appointment_at: string | null;
  service_price: number | null;
};

export const rangeLabels = {
  "24h": "Last 24 hours",
  "7days": "Last 7 days",
  "30days": "Last 30 days",
  "90days": "Last 90 days",
};

function startOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

export function getChartData(
  appointments: ChartAppointment[],
  range: ChartRange
): ChartPoint[] {
  const validAppointments = appointments.filter(
    (appointment) => appointment.appointment_at
  );

  const now = new Date();

  if (range === "24h") {
    const hours = [0, 4, 8, 12, 16, 20];

    return hours.map((hour) => {
      const start = new Date(now);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setHours(hour + 4, 0, 0, 0);

      const matchingAppointments = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= start && appointmentDate < end;
      });

      return {
        label: `${hour.toString().padStart(2, "0")}:00`,
        bookings: matchingAppointments.length,
        revenue: matchingAppointments.reduce(
          (sum, appointment) => sum + (appointment.service_price || 0),
          0
        ),
      };
    });
  }

  if (range === "7days") {
    const today = startOfDay(now);

    return Array.from({ length: 7 }).map((_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - index));

      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const matchingAppointments = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= day && appointmentDate < nextDay;
      });

      return {
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        bookings: matchingAppointments.length,
        revenue: matchingAppointments.reduce(
          (sum, appointment) => sum + (appointment.service_price || 0),
          0
        ),
      };
    });
  }

  if (range === "30days") {
    const today = startOfDay(now);

    return Array.from({ length: 4 }).map((_, index) => {
      const start = new Date(today);
      start.setDate(today.getDate() - (28 - index * 7));

      const end = new Date(start);
      end.setDate(start.getDate() + 7);

      const matchingAppointments = validAppointments.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_at as string);
        return appointmentDate >= start && appointmentDate < end;
      });

      return {
        label: `Week ${index + 1}`,
        bookings: matchingAppointments.length,
        revenue: matchingAppointments.reduce(
          (sum, appointment) => sum + (appointment.service_price || 0),
          0
        ),
      };
    });
  }

  const today = startOfDay(now);

  return Array.from({ length: 3 }).map((_, index) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (90 - index * 30));

    const end = new Date(start);
    end.setDate(start.getDate() + 30);

    const matchingAppointments = validAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointment_at as string);
      return appointmentDate >= start && appointmentDate < end;
    });

    return {
      label: `Month ${index + 1}`,
      bookings: matchingAppointments.length,
      revenue: matchingAppointments.reduce(
        (sum, appointment) => sum + (appointment.service_price || 0),
        0
      ),
    };
  });
}