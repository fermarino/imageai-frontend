import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');  // Estado para o texto do prompt
  const [imageUrl, setImageUrl] = useState('');  // Estado para armazenar o URL da imagem gerada
  const [loading, setLoading] = useState(false);  // Estado de carregamento
  const [apiResponseTime, setApiResponseTime] = useState(null);  // Estado para tempo de resposta da API
  const [error, setError] = useState(null);  // Estado para mensagens de erro
  const [darkMode, setDarkMode] = useState(false);  // Estado para o modo escuro/claro

  const generateImage = async () => {
    if (!prompt) return;  // Verifica se o prompt não está vazio

    setLoading(true);  // Inicia o carregamento
    setError(null);  // Limpa qualquer erro anterior

    const startTime = performance.now();  // Marca o início da requisição

    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev',  // URL da API do Hugging Face
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',  // Sua chave de API
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,  // O prompt para a geração da imagem
          }),
        }
      );

      const endTime = performance.now();  // Marca o fim da requisição
      const responseTime = endTime - startTime;  // Calcula o tempo de resposta
      setApiResponseTime(responseTime);  // Atualiza o tempo de resposta

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }

      const imageBlob = await response.blob();  // Obtém o Blob da imagem
      const contentType = response.headers.get('Content-Type');  // Verifica o tipo de conteúdo

      if (!contentType.startsWith('image')) {
        throw new Error('A resposta não contém uma imagem');
      }

      const imageObjectUrl = URL.createObjectURL(imageBlob);  // Cria a URL da imagem
      setImageUrl(imageObjectUrl);  // Exibe a imagem gerada

    } catch (error) {
      console.error('Erro ao gerar a imagem:', error);
      setError(`Erro ao gerar a imagem: ${error.message}`);  // Exibe o erro se ocorrer
    } finally {
      setLoading(false);  // Finaliza o carregamento
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);  // Alterna entre os modos
    document.body.classList.toggle('dark-mode', !darkMode);  // Alterna a classe no body
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'generated-image.png';  // Nome do arquivo de imagem
      link.click();  // Aciona o download
    }
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header com título estilizado e ícone para modo escuro à direita */}
      <header className="header">
        <h1 className="title">GenImageAI</h1>
        <button className="dark-light-toggle" onClick={toggleDarkMode}>
          <span className="toggle-icon">🌙</span>
        </button>
      </header>

      {/* Prompt e botão de gerar imagem centralizados */}
      <div className="prompt-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="input"
          placeholder="Digite seu prompt aqui..."
        />
        <button
          className="button"
          onClick={generateImage}
          disabled={loading} // Desabilita o botão enquanto carrega a imagem
        >
          {loading ? 'Gerando...' : 'Gerar Imagem'}
        </button>
      </div>

      {/* Imagem gerada no centro da página */}
      {imageUrl && (
        <div className="image-container">
          <img src={imageUrl} alt="Generated" className="generated-image" />
        </div>
      )}

      {/* Botão de download ou nova geração */}
      {imageUrl && (
        <div className="action-buttons">
          <button className="button" onClick={downloadImage}>
            Baixar Imagem
          </button>
          <button className="button" onClick={generateImage}>
            Gerar Novamente
          </button>
        </div>
      )}

      {/* Mensagens de erro ou tempo de resposta */}
      {error && <div className="error">{error}</div>}
      {apiResponseTime && <div className="response-time">Tempo de resposta: {apiResponseTime.toFixed(2)} ms</div>}
    </div>
  );
}

export default App;
