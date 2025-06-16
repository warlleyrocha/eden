export function formatPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length !== 11) return phone; // retorna original se não tiver 11 dígitos

  const ddd = digitsOnly.slice(0, 2);
  const prefixo = digitsOnly.slice(2, 7);
  const sufixo = digitsOnly.slice(7);

  return `(${ddd})${prefixo}-${sufixo}`;
}
