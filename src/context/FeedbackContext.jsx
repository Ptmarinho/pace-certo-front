import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const FeedbackContext = createContext(null);

/** Mensagens de sucesso/erro exibidas em um "toast" no rodapé da tela. */
export function FeedbackProvider({ children }) {
  const [mensagem, setMensagem] = useState({ texto: '', severidade: 'success', chave: 0 });
  const [aberto, setAberto] = useState(false);

  const mostrar = useCallback((texto, severidade) => {
    setMensagem({ texto, severidade, chave: Date.now() });
    setAberto(true);
  }, []);

  const valor = useMemo(
    () => ({
      sucesso: (texto) => mostrar(texto, 'success'),
      erro: (texto) => mostrar(texto, 'error'),
      info: (texto) => mostrar(texto, 'info'),
    }),
    [mostrar],
  );

  function fechar(_evento, motivo) {
    if (motivo !== 'clickaway') setAberto(false);
  }

  return (
    <FeedbackContext.Provider value={valor}>
      {children}
      <Snackbar
        key={mensagem.chave}
        open={aberto}
        autoHideDuration={4000}
        onClose={fechar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={mensagem.severidade} variant="filled" onClose={fechar} sx={{ width: '100%' }}>
          {mensagem.texto}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
