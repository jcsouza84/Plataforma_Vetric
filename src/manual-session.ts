/**
 * Configuração manual de sessão
 * Use este arquivo quando precisar bypassar o login automático
 */

export interface ManualSession {
  enabled: boolean;
  cookies: string[];  // Array de cookies no formato "nome=valor"
  token?: string;     // Token JWT se disponível
}

/**
 * INSTRUÇÕES:
 * 
 * 1. Faça login manual no navegador em:
 *    https://mundologic.intelbras-cve-pro.com.br/auth/login
 * 
 * 2. Abra DevTools → Application → Cookies
 * 
 * 3. Copie TODOS os cookies do domínio intelbras-cve-pro.com.br
 * 
 * 4. Cole abaixo no formato: "nome=valor"
 * 
 * 5. Se houver um token JWT na response do login, cole também
 * 
 * 6. Mude 'enabled' para true
 */

export const manualSession: ManualSession = {
  // Sessão manual ATIVADA - usando token JWT
  enabled: true,
  
  // CVE-PRO não usa cookies de sessão, apenas token JWT
  cookies: [],
  
  // Token JWT capturado do login
  token: "COE51Wx4_wKB7HVPgSmrXciaQBlewjQ_zCCkn-KVvGTNNob74JmrIk4neBWwEBebvh89Y01TFigcCHS85nCncIe5IneVqwP-dI7EL-gzNWQoMBgrtt5mSO9gmi7h1u2Wd-3p6EwPcU8GopEoSMM2_tr38nxw4FK0DJtVuc8urjcnMvJ6L_0ss8Q7faujM8BSoZLZPtXtnOFnZakJ3OXAPj7G0p7O6-onCcxMKKFiaibB0LHY7XKIFe04JjJ8aoUzzt6hkSQc0Q177JQ6At2Fp8t-jizB4nzUdpRV8F5allXQ9A9rbEYKOkFfcyjxClGPGOhdcJL8PBAKu3D_sKW3dTe4SfjcLrC2ZOqDmnHdWcOYvlvOGQhNjAa4eQ-OkfpDCQguvOTtqnX1wF7G3cmbgWR358MDsDBqyFu4SJQBRliIerKzVBab_lmrWQ",
};

