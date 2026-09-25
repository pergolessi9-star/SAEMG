export interface RequirementPreset {
  id: string;
  article: string;
  title: string;
  description: string;
  riskCategory: 'Alto Riesgo' | 'Transparencia / Riesgo Limitado' | 'General';
  requirementText: string;
}

export const AI_ACT_PRESETS: RequirementPreset[] = [
  {
    id: 'art-10',
    article: 'Artículo 10',
    title: 'Gobernanza y gestión de datos',
    description: 'Calidad de datos, mitigación de sesgos estadísticos y validación de representatividad demográfica.',
    riskCategory: 'Alto Riesgo',
    requirementText: 'Artículo 10 del EU AI Act: Los sistemas de IA de alto riesgo que utilicen técnicas que impliquen el entrenamiento de modelos deberán desarrollarse con conjuntos de datos de entrenamiento, validación y prueba sometidos a prácticas apropiadas de gobernanza y gestión de datos. Deben examinarse y mitigarse activamente los posibles sesgos discriminatorios y garantizar la adecuada representatividad demográfica y geográfica de los datos.',
  },
  {
    id: 'art-12',
    article: 'Artículo 12',
    title: 'Mantenimiento de registros (Logging)',
    description: 'Registro automático y trazabilidad continua de eventos durante todo el ciclo de vida del sistema.',
    riskCategory: 'Alto Riesgo',
    requirementText: 'Artículo 12 del EU AI Act: Los sistemas de IA de alto riesgo deberán diseñarse y desarrollarse con capacidades técnicas que permitan el registro automático de eventos (logs) a lo largo de su ciclo de vida. Las capacidades de registro garantizarán un nivel de trazabilidad continuo del funcionamiento del sistema durante toda su vida útil, permitiendo detectar situaciones de riesgo o anomalías.',
  },
  {
    id: 'art-13',
    article: 'Artículo 13',
    title: 'Transparencia y provisión de información',
    description: 'Documentación técnica, limitaciones previsibles y claridad en las especificaciones para los usuarios.',
    riskCategory: 'Alto Riesgo',
    requirementText: 'Artículo 13 del EU AI Act: Los sistemas de IA de alto riesgo deberán diseñarse y desarrollarse para garantizar un funcionamiento suficientemente transparente como para permitir a los responsables del despliegue interpretar los resultados del sistema y utilizarlo adecuadamente. Deberán ir acompañados de instrucciones de uso comprensibles, especificaciones de rendimiento, grado de precisión y limitaciones operativas.',
  },
  {
    id: 'art-14',
    article: 'Artículo 14',
    title: 'Supervisión humana (Human-in-the-loop)',
    description: 'Mecanismos para que personas físicas supervisen la IA y puedan anularla o interrumpirla de emergencia.',
    riskCategory: 'Alto Riesgo',
    requirementText: 'Artículo 14 del EU AI Act: Los sistemas de IA de alto riesgo deberán diseñarse y desarrollarse de manera que puedan ser supervisados eficazmente por personas físicas durante el periodo en que estén en uso. La supervisión humana incluirá la capacidad técnica de no utilizar el resultado, invalidarlo, corregirlo o interrumpir inmediatamente el sistema mediante un botón o mecanismo de parada de emergencia.',
  },
  {
    id: 'art-15',
    article: 'Artículo 15',
    title: 'Robustez técnica y ciberseguridad',
    description: 'Resiliencia frente a fallos, ataques adversarios, envenenamiento de datos e inyecciones de prompts.',
    riskCategory: 'Alto Riesgo',
    requirementText: 'Artículo 15 del EU AI Act: Los sistemas de IA de alto riesgo deberán diseñarse y desarrollarse de modo que alcancen un nivel adecuado de precisión, robustez y ciberseguridad, y funcionen de manera uniforme en todos estos aspectos a lo largo de su ciclo de vida. Deberán ser resistentes a errores, fallos de software y ataques adversarios (adversarial attacks, prompt injection, data poisoning).',
  },
  {
    id: 'art-50',
    article: 'Artículo 50',
    title: 'Marcado de contenido y avisos de IA',
    description: 'Identificación de contenidos sintéticos/deepfakes mediante marcas de agua digitales (watermarking).',
    riskCategory: 'Transparencia / Riesgo Limitado',
    requirementText: 'Artículo 50 del EU AI Act: Los proveedores de sistemas de IA que generen contenidos sintéticos de audio, imagen, vídeo o texto garantizarán que los resultados del sistema estén marcados en un formato legible por máquina y sean detectables como generados o manipulados artificialmente (marcas de agua digitales, metadatos de procedencia C2PA o técnicas equivalentes).',
  },
];

export interface SampleRepo {
  name: string;
  url: string;
  tag: string;
  description: string;
  recommendedArticleId: string;
}

export const SAMPLE_REPOS: SampleRepo[] = [
  {
    name: 'MedAI-Diagnostic',
    url: 'https://github.com/medai/diagnostic-vision',
    tag: 'Alto Riesgo (Salud)',
    description: 'Sistema de visión por ordenador para rayos X sin validación demográfica de sesgos ni botón de parada médica.',
    recommendedArticleId: 'art-10',
  },
  {
    name: 'CustomerCare-LLM',
    url: 'https://github.com/customer-ai/support-bot',
    tag: 'Atención al Cliente',
    description: 'Asistente conversacional con logging de eventos y cláusula de aviso legal al usuario con escalado humano.',
    recommendedArticleId: 'art-12',
  },
  {
    name: 'GenArt-Watermark',
    url: 'https://github.com/synth-media/watermarking-engine',
    tag: 'Marcado Digital',
    description: 'Motor de síntesis visual con inserción criptográfica de metadatos C2PA y marcado de contenido de IA.',
    recommendedArticleId: 'art-50',
  },
];
