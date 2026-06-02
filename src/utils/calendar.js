export const downloadICS = (appointment) => {
  if (!appointment || !appointment.date || !appointment.time) return;

  // Format: YYYY-MM-DD and HH:MM
  const dateParts = appointment.date.split('-');
  const timeParts = appointment.time.split(':');
  
  if (dateParts.length !== 3 || timeParts.length < 2) return;

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];
  const hour = timeParts[0];
  const minute = timeParts[1];

  // Start Date (local time string without 'Z' so it defaults to user's device timezone)
  const startStr = `${year}${month}${day}T${hour}${minute}00`;

  // End Date (assume 45 minutes duration)
  const startDate = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hour, 10),
    parseInt(minute, 10),
    0
  );
  
  const endDate = new Date(startDate.getTime() + 45 * 60 * 1000);
  
  const endYear = endDate.getFullYear();
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
  const endDay = String(endDate.getDate()).padStart(2, '0');
  const endHour = String(endDate.getHours()).padStart(2, '0');
  const endMinute = String(endDate.getMinutes()).padStart(2, '0');
  
  const endStr = `${endYear}${endMonth}${endDay}T${endHour}${endMinute}00`;
  
  // Stamp
  const now = new Date();
  const stampStr = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Escape special chars for ICS fields
  const escapeText = (text) => {
    if (!text) return '';
    return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  };

  const service = escapeText(appointment.service || 'Corte de Cabelo');
  const barbershop = escapeText(appointment.barbershopName || appointment.barbershop_name || 'BarberPro');
  const notes = escapeText(appointment.clientNotes || appointment.client_notes || '');
  const address = escapeText(appointment.barbershopAddress || appointment.barbershop_address || 'Na barbearia');

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BarberPro//Agendamento//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:appointment-${appointment.id || Math.random().toString(36).substring(2, 9)}`,
    `DTSTAMP:${stampStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:💈 ${service} - ${barbershop}`,
    `DESCRIPTION:Seu agendamento no BarberPro está confirmado!\\nServiço: ${service}\\nNotas: ${notes}`,
    `LOCATION:${address}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `agendamento-barberpro-${appointment.id || 'novo'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
