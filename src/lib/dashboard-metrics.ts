export type DashboardClient = {
  id: number;
  name: string;
  service: string | null;
  status: string | null;
};

export type DashboardService = {
  id: number;
  name: string;
};

export type DashboardAppointment = {
  id: number;
  client_name: string;
  service: string;
  service_id: number | null;
  appointment_at: string | null;
  service_price: number | null;
};

export function getServiceBookingCounts(appointments: DashboardAppointment[]) {
  return appointments.reduce<Record<string, number>>((acc, appointment) => {
    if (!appointment.service) return acc;

    acc[appointment.service] = (acc[appointment.service] || 0) + 1;
    return acc;
  }, {});
}

export function getTotalRevenue(appointments: DashboardAppointment[]) {
  return appointments.reduce((sum, appointment) => {
    return sum + (appointment.service_price || 0);
  }, 0);
}

export function getCurrentMonthRevenue(
  appointments: DashboardAppointment[],
  now: Date
) {
  return appointments.reduce((sum, appointment) => {
    if (!appointment.appointment_at) return sum;

    const appointmentDate = new Date(appointment.appointment_at);

    const isCurrentMonth =
      appointmentDate.getMonth() === now.getMonth() &&
      appointmentDate.getFullYear() === now.getFullYear();

    return isCurrentMonth ? sum + (appointment.service_price || 0) : sum;
  }, 0);
}

export function getTodaysAppointments(
  appointments: DashboardAppointment[],
  now: Date
) {
  return appointments.filter((appointment) => {
    if (!appointment.appointment_at) return false;

    const appointmentDate = new Date(appointment.appointment_at);
    return appointmentDate.toDateString() === now.toDateString();
  }).length;
}

export function getMostBookedService(appointments: DashboardAppointment[]) {
  const serviceBookingCounts = getServiceBookingCounts(appointments);

  return (
    Object.entries(serviceBookingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "No service yet"
  );
}

export function getTopServices(
  appointments: DashboardAppointment[],
  services: DashboardService[]
) {
  const serviceMapById = new Map(services.map((service) => [service.id, service]));

  const serviceMapByName = new Map(
    services.map((service) => [service.name.toLowerCase(), service])
  );

  const serviceStats = appointments.reduce<
    Record<string, { id: number | null; name: string; bookings: number; revenue: number }>
  >((acc, appointment) => {
    if (!appointment.service) return acc;

    const matchedService =
      appointment.service_id
        ? serviceMapById.get(appointment.service_id)
        : serviceMapByName.get(appointment.service.toLowerCase());

    const serviceKey = matchedService
      ? `id-${matchedService.id}`
      : `name-${appointment.service.toLowerCase()}`;

    const serviceName = matchedService?.name || appointment.service;

    if (!acc[serviceKey]) {
      acc[serviceKey] = {
        id: matchedService?.id || appointment.service_id || null,
        name: serviceName,
        bookings: 0,
        revenue: 0,
      };
    }

    acc[serviceKey].bookings += 1;
    acc[serviceKey].revenue += appointment.service_price || 0;

    return acc;
  }, {});

  return Object.values(serviceStats)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 3);
}

export function getRecentRevenueActivity(
  appointments: DashboardAppointment[]
) {
  return [...appointments]
    .filter((appointment) => appointment.service_price && appointment.appointment_at)
    .sort(
      (a, b) =>
        new Date(b.appointment_at || "").getTime() -
        new Date(a.appointment_at || "").getTime()
    )
    .slice(0, 5);
}