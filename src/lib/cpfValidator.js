/**
 * Validador de CPF com dígito verificador
 * Implementa o algoritmo oficial de validação de CPF brasileiro
 */

/**
 * Valida um CPF usando o algoritmo de dígito verificador
 * @param {string} cpf - CPF com ou sem formatação (ex: "123.456.789-09" ou "12345678909")
 * @returns {boolean} true se CPF é válido, false caso contrário
 */
export function validarCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') return false;

  // Remover formatação
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Validar comprimento
  if (cpfLimpo.length !== 11) return false;

  // Rejeitar CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  // Calcular primeiro dígito verificador
  let soma = 0;
  let multiplicador = 10;

  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * multiplicador;
    multiplicador--;
  }

  let resto = soma % 11;
  const primeiroDigito = resto < 2 ? 0 : 11 - resto;

  // Validar primeiro dígito
  if (parseInt(cpfLimpo[9]) !== primeiroDigito) return false;

  // Calcular segundo dígito verificador
  soma = 0;
  multiplicador = 11;

  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * multiplicador;
    multiplicador--;
  }

  resto = soma % 11;
  const segundoDigito = resto < 2 ? 0 : 11 - resto;

  // Validar segundo dígito
  if (parseInt(cpfLimpo[10]) !== segundoDigito) return false;

  return true;
}

/**
 * Formata um CPF para o padrão brasileiro (XXX.XXX.XXX-XX)
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado
 */
export function formatarCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return cpf;
  return `${cpfLimpo.slice(0, 3)}.${cpfLimpo.slice(3, 6)}.${cpfLimpo.slice(6, 9)}-${cpfLimpo.slice(9)}`;
}

/**
 * Remove formatação de CPF
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {string} CPF sem formatação
 */
export function limparCPF(cpf) {
  return cpf.replace(/\D/g, '');
}
