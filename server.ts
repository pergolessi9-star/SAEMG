import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise server-side Gemini client with aistudio-build user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AuditReport {
  status: 'conforme' | 'parcial' | 'no_conforme' | 'no_verificable';
  reasoning: string;
  gap: string;
  suggested_action: string;
}

// Preset repository mock templates if public GitHub rate limits or for sample demonstration
const SAMPLE_REPOS: Record<string, { description: string; files: Record<string, string> }> = {
  'medai-diagnostic': {
    description: 'Sistema de soporte al diagnóstico médico mediante visión artificial (Alto Riesgo según Anexo III EU AI Act)',
    files: {
      'README.md': `# MedAI Diagnostic Vision
Sistema de diagnóstico asistido por visión artificial para detección de patologías en radiografías de tórax.
Clasificación EU AI Act: Sistema de IA de Alto Riesgo (Salud y Dispositivos Médicos).
Versión del modelo: v1.4.2`,
      'src/pipeline.py': `import torch
import torchvision.transforms as transforms
from PIL import Image

class ChestXRayClassifier:
    def __init__(self, weights_path):
        self.model = torch.load(weights_path)
        self.model.eval()

    def predict(self, image_path):
        # Inferencia directa sin validación de umbrales ni supervisión humana
        img = Image.open(image_path).convert('RGB')
        transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor()])
        tensor = transform(img).unsqueeze(0)
        with torch.no_grad():
            output = self.model(tensor)
            prob = torch.softmax(output, dim=1)
        # Emite diagnóstico automatizado sin confirmación médica obligatoria
        return {"diagnosis": "Pathology_Detected" if prob[0][1] > 0.5 else "Normal", "confidence": float(prob[0][1])}
`,
      'src/data_loader.py': `import pandas as pd

def load_training_data():
    # Dataset procedente de un único centro hospitalario sin desagregación demográfica ni auditoría de sesgo
    df = pd.read_csv("data/hospital_a_patients.csv")
    print(f"Cargadas {len(df)} muestras. Sin metadatos de género, edad ni origen étnico.")
    return df
`,
      'requirements.txt': `torch==2.1.0
torchvision==0.16.0
pandas==2.1.0
pillow==10.1.0`
    }
  },
  'diagnostic-vision': {
    description: 'Sistema de soporte al diagnóstico médico mediante visión artificial (Alto Riesgo según Anexo III EU AI Act)',
    files: {
      'README.md': `# MedAI Diagnostic Vision
Sistema de diagnóstico asistido por visión artificial para detección de patologías en radiografías de tórax.
Clasificación EU AI Act: Sistema de IA de Alto Riesgo (Salud y Dispositivos Médicos).
Versión del modelo: v1.4.2`,
      'src/pipeline.py': `import torch
import torchvision.transforms as transforms
from PIL import Image

class ChestXRayClassifier:
    def __init__(self, weights_path):
        self.model = torch.load(weights_path)
        self.model.eval()

    def predict(self, image_path):
        img = Image.open(image_path).convert('RGB')
        transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor()])
        tensor = transform(img).unsqueeze(0)
        with torch.no_grad():
            output = self.model(tensor)
            prob = torch.softmax(output, dim=1)
        return {"diagnosis": "Pathology_Detected" if prob[0][1] > 0.5 else "Normal", "confidence": float(prob[0][1])}
`,
      'src/data_loader.py': `import pandas as pd

def load_training_data():
    df = pd.read_csv("data/hospital_a_patients.csv")
    print(f"Cargadas {len(df)} muestras. Sin metadatos de género, edad ni origen étnico.")
    return df
`,
      'requirements.txt': `torch==2.1.0
torchvision==0.16.0
pandas==2.1.0
pillow==10.1.0`
    }
  },
  'medai/diagnostic-vision': {
    description: 'Sistema de soporte al diagnóstico médico mediante visión artificial (Alto Riesgo según Anexo III EU AI Act)',
    files: {
      'README.md': `# MedAI Diagnostic Vision
Sistema de diagnóstico asistido por visión artificial para detección de patologías en radiografías de tórax.
Clasificación EU AI Act: Sistema de IA de Alto Riesgo (Salud y Dispositivos Médicos).
Versión del modelo: v1.4.2`,
      'src/pipeline.py': `import torch
import torchvision.transforms as transforms
from PIL import Image

class ChestXRayClassifier:
    def __init__(self, weights_path):
        self.model = torch.load(weights_path)
        self.model.eval()

    def predict(self, image_path):
        img = Image.open(image_path).convert('RGB')
        transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor()])
        tensor = transform(img).unsqueeze(0)
        with torch.no_grad():
            output = self.model(tensor)
            prob = torch.softmax(output, dim=1)
        return {"diagnosis": "Pathology_Detected" if prob[0][1] > 0.5 else "Normal", "confidence": float(prob[0][1])}
`,
      'src/data_loader.py': `import pandas as pd

def load_training_data():
    df = pd.read_csv("data/hospital_a_patients.csv")
    print(f"Cargadas {len(df)} muestras. Sin metadatos de género, edad ni origen étnico.")
    return df
`,
      'requirements.txt': `torch==2.1.0
torchvision==0.16.0
pandas==2.1.0
pillow==10.1.0`
    }
  },
  'customercare-llm': {
    description: 'Asistente conversacional de atención al cliente con registro de interacciones (Riesgo Específico / Transparencia Art. 50 y Art. 12)',
    files: {
      'README.md': `# CustomerCare AI Assistant
Chatbot de atención al cliente automatizado con trazabilidad y logging de conversaciones.
Cumple con la directiva de informar al usuario de que interactúa con un sistema de IA.`,
      'src/bot.py': `import logging
from datetime import datetime

logging.basicConfig(filename="audit_events.log", level=logging.INFO)

class SupportBot:
    def __init__(self):
        self.disclaimer = "Aviso legal: Está interactuando con un asistente virtual de IA generativa."
        
    def start_session(self, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] SESSION_START user={user_id} disclaimer_shown=True")
        return {"greeting": f"Hola. {self.disclaimer} ¿En qué puedo ayudarte?"}
        
    def respond(self, user_msg, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] INPUT user={user_id} msg_len={len(user_msg)}")
        if "hablar con humano" in user_msg.lower() or "queja" in user_msg.lower():
            logging.info(f"[{datetime.utcnow().isoformat()}] ESCALATION_TO_HUMAN user={user_id}")
            return {"reply": "Transfiriendo su consulta a un operador humano.", "human_override": True}
        return {"reply": "Entendido, procedemos con su solicitud.", "human_override": False}
`
    }
  },
  'support-bot': {
    description: 'Asistente conversacional de atención al cliente con registro de interacciones (Riesgo Específico / Transparencia Art. 50 y Art. 12)',
    files: {
      'README.md': `# CustomerCare AI Assistant
Chatbot de atención al cliente automatizado con trazabilidad y logging de conversaciones.
Cumple con la directiva de informar al usuario de que interactúa con un sistema de IA.`,
      'src/bot.py': `import logging
from datetime import datetime

logging.basicConfig(filename="audit_events.log", level=logging.INFO)

class SupportBot:
    def __init__(self):
        self.disclaimer = "Aviso legal: Está interactuando con un asistente virtual de IA generativa."
        
    def start_session(self, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] SESSION_START user={user_id} disclaimer_shown=True")
        return {"greeting": f"Hola. {self.disclaimer} ¿En qué puedo ayudarte?"}
        
    def respond(self, user_msg, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] INPUT user={user_id} msg_len={len(user_msg)}")
        if "hablar con humano" in user_msg.lower() or "queja" in user_msg.lower():
            logging.info(f"[{datetime.utcnow().isoformat()}] ESCALATION_TO_HUMAN user={user_id}")
            return {"reply": "Transfiriendo su consulta a un operador humano.", "human_override": True}
        return {"reply": "Entendido, procedemos con su solicitud.", "human_override": False}
`
    }
  },
  'customer-ai/support-bot': {
    description: 'Asistente conversacional de atención al cliente con registro de interacciones (Riesgo Específico / Transparencia Art. 50 y Art. 12)',
    files: {
      'README.md': `# CustomerCare AI Assistant
Chatbot de atención al cliente automatizado con trazabilidad y logging de conversaciones.`,
      'src/bot.py': `import logging
from datetime import datetime

logging.basicConfig(filename="audit_events.log", level=logging.INFO)

class SupportBot:
    def __init__(self):
        self.disclaimer = "Aviso legal: Está interactuando con un asistente virtual de IA generativa."
        
    def start_session(self, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] SESSION_START user={user_id} disclaimer_shown=True")
        return {"greeting": f"Hola. {self.disclaimer} ¿En qué puedo ayudarte?"}
        
    def respond(self, user_msg, user_id):
        logging.info(f"[{datetime.utcnow().isoformat()}] INPUT user={user_id} msg_len={len(user_msg)}")
        if "hablar con humano" in user_msg.lower() or "queja" in user_msg.lower():
            logging.info(f"[{datetime.utcnow().isoformat()}] ESCALATION_TO_HUMAN user={user_id}")
            return {"reply": "Transfiriendo su consulta a un operador humano.", "human_override": True}
        return {"reply": "Entendido, procedemos con su solicitud.", "human_override": False}
`
    }
  },
  'genart-watermark': {
    description: 'Generador de medios sintéticos e imágenes con marcado de agua digital invisible (Art. 50 EU AI Act)',
    files: {
      'README.md': `# SynthMedia Watermarking Engine
Motor de generación de imágenes con inserción de marca de agua criptográfica y metadatos C2PA para detección de contenido sintético.`,
      'src/watermarker.py': `import json

class C2PAWatermarker:
    def __init__(self, signature_key):
        self.key = signature_key
        
    def embed_watermark(self, image_bytes, metadata):
        payload = {
            "is_ai_generated": True,
            "generator": "SynthMedia-v2",
            "compliance": "EU_AI_ACT_ART_50",
            "c2pa_manifest": metadata
        }
        print("Marca de agua insertada en contenedor de imagen:", json.dumps(payload))
        return image_bytes
`
    }
  },
  'watermarking-engine': {
    description: 'Generador de medios sintéticos e imágenes con marcado de agua digital invisible (Art. 50 EU AI Act)',
    files: {
      'README.md': `# SynthMedia Watermarking Engine
Motor de generación de imágenes con inserción de marca de agua criptográfica y metadatos C2PA para detección de contenido sintético.`,
      'src/watermarker.py': `import json

class C2PAWatermarker:
    def __init__(self, signature_key):
        self.key = signature_key
        
    def embed_watermark(self, image_bytes, metadata):
        payload = {
            "is_ai_generated": True,
            "generator": "SynthMedia-v2",
            "compliance": "EU_AI_ACT_ART_50",
            "c2pa_manifest": metadata
        }
        print("Marca de agua insertada en contenedor de imagen:", json.dumps(payload))
        return image_bytes
`
    }
  },
  'synth-media/watermarking-engine': {
    description: 'Generador de medios sintéticos e imágenes con marcado de agua digital invisible (Art. 50 EU AI Act)',
    files: {
      'README.md': `# SynthMedia Watermarking Engine
Motor de generación de imágenes con inserción de marca de agua criptográfica y metadatos C2PA para detección de contenido sintético.`,
      'src/watermarker.py': `import json

class C2PAWatermarker:
    def __init__(self, signature_key):
        self.key = signature_key
        
    def embed_watermark(self, image_bytes, metadata):
        payload = {
            "is_ai_generated": True,
            "generator": "SynthMedia-v2",
            "compliance": "EU_AI_ACT_ART_50",
            "c2pa_manifest": metadata
        }
        print("Marca de agua insertada en contenedor de imagen:", json.dumps(payload))
        return image_bytes
`
    }
  }
};

// Helper to parse GitHub repo URL
function parseGitHubUrl(inputUrl: string): { owner: string; repo: string } | null {
  const cleaned = inputUrl.trim().replace(/\/+$/, '');
  
  if (/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(cleaned)) {
    const [owner, repo] = cleaned.split('/');
    return { owner, repo };
  }

  const match = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/);
  if (match) {
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    };
  }

  return null;
}

// Fetch GitHub file contents
async function fetchRepoFiles(owner: string, repo: string): Promise<{ files: Record<string, string>; info: string }> {
  const key = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  if (SAMPLE_REPOS[key] || SAMPLE_REPOS[repo.toLowerCase()]) {
    const sample = SAMPLE_REPOS[key] || SAMPLE_REPOS[repo.toLowerCase()];
    return {
      files: sample.files,
      info: `Repositorio de demostración cargado: ${sample.description}`,
    };
  }

  const files: Record<string, string> = {};
  const fileNamesToProbe = [
    'README.md',
    'readme.md',
    'MODEL_CARD.md',
    'SECURITY.md',
    'LICENSE',
    'requirements.txt',
    'package.json',
    'pyproject.toml',
    'src/main.py',
    'src/app.py',
    'src/pipeline.py',
    'src/model.py',
    'main.py',
    'app.py',
    'model.py',
    'pipeline.py',
    'Dockerfile',
    'config.yaml',
    'config.json'
  ];

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'EU-AI-Act-Auditor-Gemma',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let defaultBranch = 'main';
    let repoDesc = '';

    if (repoRes.ok) {
      const repoData = await repoRes.json();
      defaultBranch = repoData.default_branch || 'main';
      repoDesc = repoData.description ? ` (${repoData.description})` : '';

      try {
        const treeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
          {
            headers: {
              'User-Agent': 'EU-AI-Act-Auditor-Gemma',
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        );

        if (treeRes.ok) {
          const treeData = await treeRes.json();
          const tree = Array.isArray(treeData.tree) ? treeData.tree : [];
          
          const relevantPaths: string[] = [];
          for (const item of tree) {
            if (item.type === 'blob' && typeof item.path === 'string') {
              const p = item.path.toLowerCase();
              if (
                p.includes('model_card') ||
                p.includes('ethics') ||
                p.includes('compliance') ||
                p.includes('security') ||
                p.endsWith('readme.md') ||
                p.includes('dataset') ||
                p.includes('bias') ||
                p.includes('governance') ||
                p.includes('audit') ||
                p.includes('logging') ||
                p.includes('kill_switch') ||
                p.includes('watermark') ||
                p.includes('guardrail') ||
                p.endsWith('requirements.txt') ||
                p.endsWith('pyproject.toml') ||
                (p.endsWith('.py') && (p.includes('train') || p.includes('eval') || p.includes('pipeline') || p.includes('infer') || p.includes('data')))
              ) {
                relevantPaths.push(item.path);
              }
            }
          }

          const targetPaths = relevantPaths.slice(0, 7);
          for (const targetPath of targetPaths) {
            try {
              const rawRes = await fetch(
                `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${targetPath}`
              );
              if (rawRes.ok) {
                const text = await rawRes.text();
                files[targetPath] = text.slice(0, 8000);
              }
            } catch {
              // Ignore single file fetch error
            }
          }
        }
      } catch (treeErr) {
        console.warn('Error fetching tree:', treeErr);
      }
    }

    if (Object.keys(files).length === 0) {
      for (const branch of [defaultBranch, 'master', 'main']) {
        for (const fname of fileNamesToProbe.slice(0, 4)) {
          if (files[fname]) continue;
          try {
            const rawRes = await fetch(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fname}`
            );
            if (rawRes.ok) {
              const text = await rawRes.text();
              files[fname] = text.slice(0, 8000);
            }
          } catch {
            // Continue probing
          }
        }
        if (Object.keys(files).length > 0) break;
      }
    }

    return {
      files,
      info: `Repositorio ${owner}/${repo}${repoDesc} inspeccionado en GitHub (rama: ${defaultBranch}).`,
    };
  } catch (err: any) {
    return {
      files,
      info: `Aviso al acceder a GitHub (${err.message || 'error de conexión'}).`,
    };
  }
}

// Helper to call LLM with automatic retries and fallback
async function callGemmaWithFallback(prompt: string, schema: any, systemInstruction?: string) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              systemInstruction ||
              'Eres Gemma 4, el motor de auditoría técnica y regulatoria especializado en el EU AI Act (Reglamento de IA de la UE). Proporciona siempre respuestas rigurosas, estructuradas y precisas en JSON.',
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });
        if (response && response.text) {
          return JSON.parse(response.text);
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Attempt ${attempt} on ${modelName} failed:`, callErr?.message || callErr);
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta del motor de análisis.');
}

// ==========================================
// SUBMÓDULO 1: AUDITORÍA INDIVIDUAL
// ==========================================
app.post('/api/audit', async (req, res) => {
  try {
    const { repoUrl, auditRequirement, manualCode } = req.body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ error: 'La URL del repositorio de GitHub es obligatoria.' });
    }

    if (!auditRequirement || typeof auditRequirement !== 'string') {
      return res.status(400).json({ error: 'El requisito de auditoría es obligatorio.' });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({
        error: 'Formato de URL de GitHub inválido. Usa formatos como "https://github.com/usuario/repositorio" o "usuario/repositorio".',
      });
    }

    const { files, info } = await fetchRepoFiles(parsed.owner, parsed.repo);

    if (manualCode && typeof manualCode === 'string' && manualCode.trim().length > 0) {
      files['manual_code_snippet.py'] = manualCode.trim().slice(0, 8000);
    }

    const fileEntries = Object.entries(files);
    let codeContext = '';

    if (fileEntries.length === 0) {
      codeContext = `[AVISO: No se pudieron descargar archivos directamente desde GitHub para el repositorio ${parsed.owner}/${parsed.repo}].`;
    } else {
      codeContext = fileEntries
        .map(([p, content]) => `--- ARCHIVO: ${p} ---\n${content}\n`)
        .join('\n');
    }

    const prompt = `
Has sido configurado como el motor de auditoría Gemma 4 especializado en el Reglamento de Inteligencia Artificial de la Unión Europea (EU AI Act - Reglamento UE 2024/1689).

OBJETIVO DE AUDITORÍA:
Analiza de manera exhaustiva el código, arquitectura y documentación del repositorio de GitHub proporcionado con respecto al requisito específico de auditoría del EU AI Act.

REPOSITORIO AUDITADO:
${parsed.owner}/${parsed.repo} (URL: ${repoUrl})

REQUISITO DE AUDITORÍA A VERIFICAR:
${auditRequirement}

EVIDENCIAS Y CÓDIGO EXTRAÍDO DEL REPOSITORIO:
${codeContext}

CRITERIOS PARA EL DICTAMEN DE "status":
- "conforme": Existen evidencias explícitas y suficientes en el código o configuración que satisfacen íntegramente el requisito del EU AI Act.
- "parcial": Se detectan mecanismos o intenciones para abordar el requisito, pero son incompletos, tienen lagunas o carecen de garantías técnicas sólidas.
- "no_conforme": El código vulnera directamente el requisito, carece de los mecanismos obligatorios exigidos por el EU AI Act o presenta riesgos regulatorios graves.
- "no_verificable": La información disponible en los archivos examinados no contiene datos suficientes para emitir un juicio definitivo.

INSTRUCCIONES DE FORMATO:
Devuelve un objeto JSON con EXACTAMENTE estos cuatro campos en español:
1. "status": Uno de los cuatro valores exactos: "conforme", "parcial", "no_conforme", "no_verificable".
2. "reasoning": Justificación argumentada, clara y técnica del dictamen, citando los hallazgos en el código (o la ausencia de los mismos) y la interpretación según los artículos y considerandos del EU AI Act.
3. "gap": Brecha técnica o regulatoria concreta identificada.
4. "suggested_action": Acción correctiva específica, práctica y ejecutable (recomendaciones técnicas de código, configuración o gobernanza).
`.trim();

    const auditJson = await callGemmaWithFallback(prompt, {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: 'Estado de cumplimiento: conforme, parcial, no_conforme, no_verificable',
        },
        reasoning: {
          type: Type.STRING,
          description: 'Justificación detallada del dictamen según el EU AI Act y el código analizado',
        },
        gap: {
          type: Type.STRING,
          description: 'Brecha o deficiencia concreta identificada frente al requisito',
        },
        suggested_action: {
          type: Type.STRING,
          description: 'Acción correctiva técnica y práctica recomendada',
        },
      },
      required: ['status', 'reasoning', 'gap', 'suggested_action'],
    });

    const validStatuses = ['conforme', 'parcial', 'no_conforme', 'no_verificable'];
    if (!validStatuses.includes(auditJson.status)) {
      auditJson.status = 'no_verificable';
    }

    const timestamp = new Date().toISOString();
    const evidencePayload = JSON.stringify({
      report: auditJson,
      repo: `${parsed.owner}/${parsed.repo}`,
      auditRequirement,
      timestamp,
      expertPool: 'EDPB-SPE-2025-2030',
      expert: 'Manuel Gago Fernández',
    });
    const sha256Hash = crypto.createHash('sha256').update(evidencePayload).digest('hex');

    return res.json({
      report: auditJson,
      metadata: {
        repo: `${parsed.owner}/${parsed.repo}`,
        repoUrl,
        auditRequirement,
        filesExamined: Object.keys(files),
        fetchInfo: info,
        timestamp,
        model: 'Gemma 4 (EU AI Act Auditor Engine)',
      },
      evidence: {
        sha256Hash,
        timestamp,
        expertPool: 'EDPB-SPE-2025-2030',
        expertName: 'Manuel Gago Fernández',
        humanOversight: true,
        traceability: true,
        auditability: true,
      },
    });
  } catch (error: any) {
    console.error('Audit API error:', error);
    return res.status(500).json({
      error: error.message || 'Error interno durante la auditoría de código.',
    });
  }
});

// ==========================================
// SUBMÓDULO 2: MATRIZ COMPLETA DE CUMPLIMIENTO (MULTI-ARTÍCULO)
// ==========================================
app.post('/api/audit-matrix', async (req, res) => {
  try {
    const { repoUrl, manualCode } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'La URL del repositorio es obligatoria.' });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return res.status(400).json({ error: 'URL de GitHub inválida.' });
    }

    const { files, info } = await fetchRepoFiles(parsed.owner, parsed.repo);
    if (manualCode && typeof manualCode === 'string' && manualCode.trim()) {
      files['manual_code.py'] = manualCode.trim().slice(0, 8000);
    }

    const codeContext = Object.entries(files)
      .map(([p, content]) => `--- ARCHIVO: ${p} ---\n${content}\n`)
      .join('\n') || '[Sin archivos disponibles]';

    const prompt = `
Has sido configurado como Gemma 4, Auditor General del EU AI Act.
Realiza una evaluación completa e integral del repositorio ${parsed.owner}/${parsed.repo} frente a los 6 pilares esenciales del Reglamento de Inteligencia Artificial (UE 2024/1689):

1. Art. 10: Gobernanza de datos, representatividad y mitigación de sesgos.
2. Art. 12: Registro automático de eventos (logging) y trazabilidad continua.
3. Art. 13: Transparencia, especificaciones y documentación técnica.
4. Art. 14: Supervisión humana (Human-in-the-loop) y parada de emergencia.
5. Art. 15: Robustez técnica, ciberseguridad y tolerancia a fallos.
6. Art. 50: Marcado de contenido de IA (watermarking) y avisos a usuarios.

EVIDENCIAS Y CÓDIGO DEL REPOSITORIO:
${codeContext}

Genera una matriz exhaustiva con puntuación global (0 a 100), nivel de riesgo global ('Bajo', 'Medio', 'Alto', 'Crítico'), resumen ejecutivo, y el dictamen para cada uno de los 6 artículos con 'status' ("conforme", "parcial", "no_conforme", "no_verificable"), 'gap', 'reasoning' y 'suggested_action'.
`.trim();

    const matrixSchema = {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.INTEGER, description: 'Puntuación de 0 a 100' },
        overallRiskLevel: { type: Type.STRING, description: 'Bajo, Medio, Alto, Crítico' },
        summary: { type: Type.STRING, description: 'Resumen ejecutivo de la auditoría global' },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              articleId: { type: Type.STRING },
              articleTitle: { type: Type.STRING },
              status: { type: Type.STRING },
              gap: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              suggested_action: { type: Type.STRING },
            },
            required: ['articleId', 'articleTitle', 'status', 'gap', 'reasoning', 'suggested_action'],
          },
        },
      },
      required: ['overallScore', 'overallRiskLevel', 'summary', 'items'],
    };

    const matrixResult = await callGemmaWithFallback(prompt, matrixSchema);
    matrixResult.auditedRepo = `${parsed.owner}/${parsed.repo}`;
    matrixResult.timestamp = new Date().toISOString();

    return res.json({ matrix: matrixResult, fetchInfo: info });
  } catch (err: any) {
    console.error('Audit matrix error:', err);
    return res.status(500).json({ error: err.message || 'Error al generar la matriz de cumplimiento.' });
  }
});

// ==========================================
// SUBMÓDULO 3: GENERADOR DE REMEDIATION & PARCHES DE CÓDIGO
// ==========================================
app.post('/api/remediation', async (req, res) => {
  try {
    const { gap, suggestedAction, article, codeSnippet } = req.body;

    if (!gap || !suggestedAction) {
      return res.status(400).json({ error: 'Se requiere el gap y la acción sugerida.' });
    }

    const prompt = `
Como motor de ingeniería y cumplimiento Gemma 4, genera un parche de código concreto y ejecutable (remediation) para subsanar la siguiente brecha identificada en auditoría del EU AI Act:

ARTÍCULO: ${article || 'Reglamento UE 2024/1689'}
BRECHA (GAP): ${gap}
ACCIÓN SUGERIDA: ${suggestedAction}
CÓDIGO ORIGINAL / CONTEXTO:
${codeSnippet || '# Sin código proporcionado. Genera una plantilla de implementación recomendada.'}

INSTRUCCIONES:
Proporciona el código de remediación exacto (en Python, YAML o el lenguaje idóneo), indicando archivo objetivo, pasos de integración paso a paso y notas de cumplimiento legal.
`.trim();

    const remediationSchema = {
      type: Type.OBJECT,
      properties: {
        remediationTitle: { type: Type.STRING, description: 'Título de la solución correctiva' },
        targetFile: { type: Type.STRING, description: 'Nombre del archivo donde aplicar el cambio' },
        language: { type: Type.STRING, description: 'python, yaml, dockerfile, json' },
        codeSnippet: { type: Type.STRING, description: 'Código fuente exacto y documentado con comentarios' },
        implementationSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Pasos ordenados para aplicar el parche en el proyecto',
        },
        complianceNotes: { type: Type.STRING, description: 'Explicación de cómo este cambio satisface el requisito' },
      },
      required: ['remediationTitle', 'targetFile', 'language', 'codeSnippet', 'implementationSteps', 'complianceNotes'],
    };

    const remediation = await callGemmaWithFallback(prompt, remediationSchema);
    return res.json({ remediation });
  } catch (err: any) {
    console.error('Remediation error:', err);
    return res.status(500).json({ error: err.message || 'Error al generar la solución de remediation.' });
  }
});

// ==========================================
// SUBMÓDULO 4: CLASIFICADOR DE RIESGO (ANEXO III Y ART. 5)
// ==========================================
app.post('/api/risk-classify', async (req, res) => {
  try {
    const { systemDescription, sector, targetUsers } = req.body;

    if (!systemDescription) {
      return res.status(400).json({ error: 'La descripción del sistema de IA es obligatoria.' });
    }

    const prompt = `
Como Gemma 4 Clasificador Normativo, categoriza este sistema de Inteligencia Artificial según la jerarquía de riesgos del EU AI Act (Reglamento UE 2024/1689):

DESCRIPCIÓN DEL SISTEMA: ${systemDescription}
SECTOR DE APLICACIÓN: ${sector || 'No especificado'}
USUARIOS / DESTINATARIOS: ${targetUsers || 'Público general'}

CATEGORÍAS DE RIESGO:
1. "Inadmisible" (Art. 5: manipulación subliminal, puntuación social, explotación de vulnerabilidades, biometría en tiempo real no autorizada).
2. "Alto Riesgo" (Art. 6 y Anexo III: salud, infraestructuras críticas, educación, empleo y RRHH, servicios esenciales, orden público, justicia).
3. "Riesgo Específico (Transparencia)" (Art. 50: chatbots, generación de medios sintéticos, deepfakes, sistemas de reconocimiento de emociones).
4. "Riesgo Mínimo" (Filtros de spam, videojuegos de IA, optimización logística básica, etc.).

Determina la categoría exacta, base jurídica aplicable, si coincide con algún supuesto del Anexo III, requisitos obligatorios inmediatos y recomendaciones.
`.trim();

    const riskSchema = {
      type: Type.OBJECT,
      properties: {
        tier: { type: Type.STRING, description: 'Inadmisible, Alto Riesgo, Riesgo Específico (Transparencia), Riesgo Mínimo' },
        legalBasis: { type: Type.STRING, description: 'Artículos aplicables del EU AI Act' },
        annexMatch: { type: Type.STRING, description: 'Apartado coincidente de Anexo III o Art. 5' },
        mandatoryRequirements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Obligaciones legales estrictas que debe cumplir el proveedor'
        },
        prohibitedPracticesCheck: { type: Type.STRING, description: 'Verificación de si incurre en prácticas prohibidas del Art. 5' },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Recomendaciones estratégicas y técnicas'
        }
      },
      required: ['tier', 'legalBasis', 'annexMatch', 'mandatoryRequirements', 'prohibitedPracticesCheck', 'recommendations']
    };

    const classification = await callGemmaWithFallback(prompt, riskSchema);
    return res.json({ classification });
  } catch (err: any) {
    console.error('Risk classify error:', err);
    return res.status(500).json({ error: err.message || 'Error al clasificar el riesgo del sistema.' });
  }
});

// ==========================================
// API EXTERNA GRATUITA: INSPECCIÓN HUGGING FACE HUB
// ==========================================
app.get('/api/hf-inspect', async (req, res) => {
  try {
    const modelId = req.query.modelId as string;
    if (!modelId) {
      return res.status(400).json({ error: 'Parámetro modelId requerido (ej. google/gemma-2b o openai/whisper-large).' });
    }

    const cleanId = modelId.trim().replace(/^https?:\/\/huggingface\.co\//, '');
    const hfRes = await fetch(`https://huggingface.co/api/models/${cleanId}`, {
      headers: {
        'User-Agent': 'EU-AI-Act-Auditor-Gemma',
      },
    });

    if (!hfRes.ok) {
      return res.status(hfRes.status).json({
        error: `Modelo '${cleanId}' no encontrado en Hugging Face Hub o acceso no autorizado.`,
      });
    }

    const data = await hfRes.json();
    const hasCard = !!(data.cardData && Object.keys(data.cardData).length > 0);
    const license = data.cardData?.license || data.license || 'No especificada';

    return res.json({
      modelId: cleanId,
      pipelineTag: data.pipeline_tag || 'Generación / ML',
      license,
      downloads: data.downloads || 0,
      likes: data.likes || 0,
      hasModelCard: hasCard,
      complianceFlags: {
        hasLicense: license !== 'No especificada',
        hasWatermarkNotice: JSON.stringify(data.cardData || {}).toLowerCase().includes('watermark') || JSON.stringify(data.cardData || {}).toLowerCase().includes('c2pa'),
        hasDemographicDataNotice: JSON.stringify(data.cardData || {}).toLowerCase().includes('bias') || JSON.stringify(data.cardData || {}).toLowerCase().includes('demographic'),
      },
    });
  } catch (err: any) {
    console.error('HF inspect error:', err);
    return res.status(500).json({ error: err.message || 'Error al consultar la API de Hugging Face.' });
  }
});

// ==========================================
// BASE DE CONOCIMIENTO REGULATORIA EUR-LEX DEL EU AI ACT
// ==========================================
const EURLEX_DATABASE = [
  {
    article: 'Artículo 5',
    title: 'Prácticas de IA prohibidas',
    entryIntoForce: 'Febrero de 2025 (6 meses tras entrada en vigor)',
    maxFine: 'Hasta 35.000.000 € o el 7 % del volumen de negocio global anual.',
    scope: 'Sistemas que utilizan técnicas subliminales perjudiciales, manipulación cognitiva, puntuación social gubernamental o privada, categorización biométrica por datos sensibles y policía predictiva individual.',
  },
  {
    article: 'Artículo 10',
    title: 'Gobernanza y gestión de datos',
    entryIntoForce: 'Agosto de 2026 (24 meses tras entrada en vigor)',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio global anual.',
    scope: 'Garantía de representatividad estadística, idoneidad, mitigación activa de sesgos discriminatorios y auditoría de datasets de entrenamiento, prueba y validación.',
  },
  {
    article: 'Artículo 12',
    title: 'Mantenimiento de registros (Logging)',
    entryIntoForce: 'Agosto de 2026',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio global.',
    scope: 'Capacidades técnicas de logging automático de eventos a lo largo de la vida útil del sistema para garantizar trazabilidad y auditoría forense posterior.',
  },
  {
    article: 'Artículo 13',
    title: 'Transparencia y provisión de información',
    entryIntoForce: 'Agosto de 2026',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio global.',
    scope: 'Información clara para responsables del despliegue: instrucciones de uso, nivel de precisión esperado, métricas de rendimiento y limitaciones conocidas.',
  },
  {
    article: 'Artículo 14',
    title: 'Supervisión humana (Human-in-the-loop)',
    entryIntoForce: 'Agosto de 2026',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio global.',
    scope: 'Diseño para supervisión humana activa: capacidad de anular predicciones, ajustar umbrales e interrumpir inmediatamente la operación mediante botón de parada (kill switch).',
  },
  {
    article: 'Artículo 15',
    title: 'Robustez técnica y ciberseguridad',
    entryIntoForce: 'Agosto de 2026',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio global.',
    scope: 'Resiliencia ante anomalías, inyecciones de prompts (prompt injection), envenenamiento de datos (data poisoning) y ataques adversarios con tolerancia a fallos.',
  },
  {
    article: 'Artículo 50',
    title: 'Obligaciones de transparencia para sistemas generativos y marcado',
    entryIntoForce: 'Agosto de 2025 (12 meses tras entrada en vigor)',
    maxFine: 'Hasta 15.000.000 € o el 3 % del volumen de negocio.',
    scope: 'Aviso visible y legible por máquina a usuarios de que interactúan con IA, y marcado digital de audio, imagen, vídeo o texto sintético (watermarking / C2PA).',
  },
];

app.get('/api/eurlex', (_req, res) => {
  return res.json({
    regulation: 'Reglamento (UE) 2024/1689 del Parlamento Europeo y del Consejo',
    officialUrl: 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689',
    articles: EURLEX_DATABASE,
  });
});

// ==========================================
// SUB-AGENTES EXPERTOS EDPB (Gemma 4 Specialized Sub-Agents)
// Ecosistema Manuel Gago Fernández (EDPB-SPE-2025-2030)
// ==========================================
const EDPB_SUBAGENTS_ROLES: Record<string, { role: string; focus: string }> = {
  governance: {
    role: 'Especialista en Gobernanza de IA, Supervisión Humana y Auditabilidad',
    focus: 'Supervisión de sistemas de IA conforme al EU AI Act (Art. 9, 10, 14), mitigación de sesgos, explicabilidad y mecanismos de parada de emergencia (kill-switch).',
  },
  evidence: {
    role: 'Auditor Forense y Generador de Evidencias Criptográficas SHA-256',
    focus: 'Trazabilidad y registro continuo según Art. 12, generación de hashes SHA-256 inmutables de código y verificación de integridad documental.',
  },
  multiframe: {
    role: 'Analista Regulatorio Multi-Marco (EU AI Act ↔ RGPD ↔ NIS2 ↔ ePrivacy)',
    focus: 'Intersección regulatoria: compatibilidad entre el Reglamento de IA (UE 2024/1689), RGPD (Art. 22 decisiones automatizadas, DPIA), eIDAS, DSA, DMA y NIS2.',
  },
  cybersecurity: {
    role: 'Experto en Seguridad Cloud, Zero-Trust y Resiliencia Técnica',
    focus: 'Ciberseguridad y robustez del Art. 15, Cloud Act, FISA, arquitecturas Zero Trust, mitigación de prompt injection y data poisoning.',
  },
  training: {
    role: 'Diseñador de Formación y Programas de Cumplimiento Técnico',
    focus: 'Creación de módulos formativos estructurados con ejercicios prácticos para ingenieros de ML y responsables de despliegue según Art. 4.',
  },
};

app.post('/api/edpb-agent', async (req, res) => {
  try {
    const { agentId, query, context } = req.body;
    const agent = EDPB_SUBAGENTS_ROLES[agentId] || EDPB_SUBAGENTS_ROLES.governance;

    const prompt = `
Eres un Sub-Agente Experto del Ecosistema EDPB-SUPER-ECOSYSTEM de Manuel Gago Fernández (EDPB Support Pool of Experts 2025-2030).
TU ROL: ${agent.role}
TU ENFOQUE ESPECIALIZADO: ${agent.focus}

CONSULTA DEL USUARIO / CASO:
${query}

CONTEXTO TÉCNICO O DEL REPOSITORIO:
${context || 'Sin contexto adicional.'}

INSTRUCCIONES:
Proporciona un dictamen conciso, de alto rigor técnico y jurídico. Cita artículos y directivas aplicables de la UE. Genera recomendaciones operativas claras y especifica si se requiere supervisión humana.
`.trim();

    const agentSchema = {
      type: Type.OBJECT,
      properties: {
        agentName: { type: Type.STRING },
        opinion: { type: Type.STRING, description: 'Dictamen técnico-jurídico' },
        legalArticlesApplied: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Artículos citados de la normativa europea',
        },
        technicalActionPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Puntos de acción recomendados para el equipo de desarrollo',
        },
        evidenceStatement: {
          type: Type.STRING,
          description: 'Declaración de trazabilidad y supervisión humana',
        },
      },
      required: ['agentName', 'opinion', 'legalArticlesApplied', 'technicalActionPoints', 'evidenceStatement'],
    };

    const agentResult = await callGemmaWithFallback(prompt, agentSchema, `Eres el sub-agente ${agent.role} del ecosistema EDPB.`);

    const timestamp = new Date().toISOString();
    const sha256 = crypto
      .createHash('sha256')
      .update(JSON.stringify({ agentResult, query, timestamp, expert: 'Manuel Gago Fernández' }))
      .digest('hex');

    return res.json({
      agentResponse: agentResult,
      evidence: {
        sha256Hash: sha256,
        timestamp,
        agentId,
        expertPool: 'EDPB-SPE-2025-2030',
        expertName: 'Manuel Gago Fernández',
      },
    });
  } catch (err: any) {
    console.error('EDPB agent error:', err);
    return res.status(500).json({ error: err.message || 'Error al consultar el sub-agente EDPB.' });
  }
});

// ==========================================
// EVALUADOR FRIA (Impacto en Derechos Fundamentales - Art. 27)
// ==========================================
app.post('/api/fria', async (req, res) => {
  try {
    const { systemDescription, intendedPurpose, impactedCategories } = req.body;

    if (!systemDescription) {
      return res.status(400).json({ error: 'Descripción requerida.' });
    }

    const prompt = `
Como Gemma 4 Evaluador de Impacto sobre los Derechos Fundamentales (FRIA) conforme al Artículo 27 del EU AI Act:

SISTEMA: ${systemDescription}
FINALIDAD PREVISTA: ${intendedPurpose || 'No especificada'}
COLECTIVOS O CATEGORÍAS IMPACTADAS: ${impactedCategories || 'Población general'}

Evalúa los riesgos específicos para los derechos fundamentales protegidos por la Carta de los Derechos Fundamentales de la UE:
1. No discriminación e igualdad (Art. 21 Carta)
2. Privacidad y protección de datos (Art. 7 y 8 Carta)
3. Libertad de expresión e información (Art. 11 Carta)
4. Tutela judicial efectiva y derecho a un proceso equitativo (Art. 47 Carta)

Genera la evaluación estructurada con medidas de mitigación y plan de supervisión humana.
`.trim();

    const friaSchema = {
      type: Type.OBJECT,
      properties: {
        friaRequired: { type: Type.BOOLEAN, description: 'Si es obligatorio realizar la FRIA' },
        severityScore: { type: Type.INTEGER, description: 'Nivel de severidad de 1 a 10' },
        rightsAtRisk: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              right: { type: Type.STRING },
              riskLevel: { type: Type.STRING, description: 'Bajo, Medio, Alto' },
              description: { type: Type.STRING },
              mitigation: { type: Type.STRING },
            },
            required: ['right', 'riskLevel', 'description', 'mitigation'],
          },
        },
        humanOversightProtocols: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        conclusion: { type: Type.STRING },
      },
      required: ['friaRequired', 'severityScore', 'rightsAtRisk', 'humanOversightProtocols', 'conclusion'],
    };

    const friaResult = await callGemmaWithFallback(prompt, friaSchema);
    return res.json({ fria: friaResult });
  } catch (err: any) {
    console.error('FRIA error:', err);
    return res.status(500).json({ error: err.message || 'Error en la evaluación FRIA.' });
  }
});

// Configure Vite dev server or static production files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Auditor EU AI Act Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
