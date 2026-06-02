import { useState, useMemo } from 'react';
import { Search, Heart, Sparkles, BookOpen, Clock, X, ArrowLeft } from 'lucide-react';
import './Blog.css';

const ARTICLES = [
  {
    id: 'art-001',
    title: 'Como identificar seu tipo de cabelo masculino',
    category: 'Tipos de Cabelo',
    readTime: '4 min',
    summary: 'Liso, ondulado, crespo ou cacheado? Descubra o seu tipo e como cuidar de cada textura para obter o melhor corte.',
    imageIcon: '🧔',
    content: `Cuidar do cabelo começa com o autoconhecimento. O cabelo masculino é classificado em quatro categorias principais:

**1. Cabelo Liso (Tipo 1):**
Geralmente mais oleoso porque o óleo do couro cabeludo escorre facilmente pelo fio reto.
- *Dica:* Lave com shampoo de limpeza profunda a cada 2 dias e evite condicionador na raiz.

**2. Cabelo Ondulado (Tipo 2):**
Forma ondas em formato de "S". Tem volume médio e tende a ter um pouco de frizz nas pontas.
- *Dica:* Use shampoos hidratantes leves e finalizadores tipo leave-in em gel ou mousse.

**3. Cabelo Cacheado (Tipo 3):**
Cachos definidos em espiral. É naturalmente mais seco nas pontas, pois o óleo tem dificuldade em percorrer as curvas.
- *Dica:* Utilize a técnica de fitagem para definir e abuse de cremes de pentear ativadores de cachos.

**4. Cabelo Crespo (Tipo 4):**
Fios bem apertados em formato de "Z" ou mola. É o tipo mais frágil e seco.
- *Dica:* Evite lavar todos os dias. Faça umectação com óleos naturais (como óleo de coco ou argan) semanalmente.

Conhecendo a sua textura, você poderá escolher produtos específicos e conversar com seu barbeiro para acertar o melhor corte para o seu formato de rosto!`
  },
  {
    id: 'art-002',
    title: 'Guia definitivo de lavagem para cabelos oleosos',
    category: 'Lavagem',
    readTime: '3 min',
    summary: 'Lavar todo dia faz mal? Qual a temperatura ideal da água? Tire todas as suas dúvidas sobre a higiene correta.',
    imageIcon: '🚿',
    content: `O excesso de oleosidade capilar é uma queixa comum entre os homens. Aqui está o passo a passo para uma lavagem perfeita:

**Evite a água muito quente:**
A água quente remove toda a proteção natural do couro cabeludo, o que ativa um "efeito rebote", fazendo com que as glândulas sebáceas produzam ainda mais óleo.
- *Dica:* Use sempre água morna ou fria.

**Aplicação do Shampoo:**
Aplique o shampoo apenas no couro cabeludo, não nas pontas. Massageie suavemente com as pontas dos dedos (nunca com as unhas) por 1 a 2 minutos.

**Frequência:**
Para cabelos muito oleosos, a lavagem diária é recomendada, mas deve ser feita com shampoos suaves de uso diário. Uma vez por semana, utilize um shampoo de limpeza profunda ou antirresíduos.

**Uso correto do condicionador:**
O condicionador fecha as cutículas do fio. Se você tiver cabelo curto, pode até dispensá-lo. Se usar, aplique apenas nas pontas e enxágue 100% do produto. Resíduos de condicionador no couro cabeludo causam caspa e oleosidade excessiva!`
  },
  {
    id: 'art-003',
    title: '5 hábitos para combater a queda capilar',
    category: 'Cuidados',
    readTime: '5 min',
    summary: 'A calvície te preocupa? Mudar alguns hábitos diários pode fortalecer os fios e retardar a perda de cabelo de forma natural.',
    imageIcon: '🍂',
    content: `A perda de cabelo afeta a autoestima de milhões de homens. Embora a genética (alopecia androgenética) seja o principal fator, a rotina diária desempenha um papel crucial na saúde capilar.

Adote estas dicas hoje mesmo para combater a queda:

**1. Reduza o estresse:**
O estresse libera cortisol, um hormônio que pode paralisar a fase de crescimento do fio (anágena), induzindo-o a cair precocemente.
- *Dica:* Pratique esportes ou meditação.

**2. Dieta rica em nutrientes:**
O cabelo precisa de proteínas, ferro, zinco e vitaminas (principalmente Biotina e Vitamina D) para crescer forte.
- *Dica:* Consuma ovos, peixes, espinafre, castanhas e carnes magras.

**3. Evite bonés e toucas em excesso:**
Usar boné por muitas horas seguidas abafa o couro cabeludo, promovendo o suor e a proliferação de fungos que enfraquecem a raiz. Nunca use boné com o cabelo úmido!

**4. Cuidado ao pentear:**
O cabelo molhado fica elástico e frágil. Use pentes de dentes largos e evite puxar com força se houver nós.

**5. Massageie o couro cabeludo:**
Durante a lavagem, faça massagens circulares. Isso estimula a circulação sanguínea na região, levando mais oxigênio e nutrientes para os bulbos capilares!`
  },
  {
    id: 'art-004',
    title: 'Tipos de pomada capilar: Matte, Efeito Molhado ou Pó?',
    category: 'Estilo',
    readTime: '3 min',
    summary: 'Qual finalizador escolher para o seu estilo de corte? Conheça a diferença entre cera, pomada matte, gel e pó modelador.',
    imageIcon: '💈',
    content: `Escolher o finalizador ideal faz toda a diferença para manter o penteado no lugar com o acabamento desejado. Conheça as opções:

**Pomada Matte (Efeito Seco):**
É o produto mais popular atualmente. Proporciona excelente fixação sem deixar brilho, ideal para penteados modernos e casuais como o quiff, pompadour ou cortes texturizados.
- *Ideal para:* Uso diário, aparência natural.

**Pomada Efeito Molhado (Gloss/Gel):**
Proporciona brilho intenso e fixação média a alta. Perfeita para penteados clássicos e formais como o *slick back* (cabelo todo penteado para trás) ou o *side part* (repartido de lado).
- *Ideal para:* Eventos formais, estilo retrô.

**Pó Modelador (Volumão):**
Um pó leve aplicado diretamente na raiz. Ele absorve a oleosidade e cria volume e textura instantâneos, deixando o cabelo com aspecto encorpado.
- *Ideal para:* Cabelos finos e penteados desordenados (estilo bagunçado).

**Gel Fixador:**
Embora muito tradicional, o gel comum resseca o cabelo e cria caspas falsas ao secar. Prefira pomadas à base de água, que saem facilmente na lavagem e não danificam os fios!`
  }
];

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['Todos', 'Tipos de Cabelo', 'Lavagem', 'Cuidados', 'Estilo'];

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((art) => {
      const matchesCategory = selectedCategory === 'Todos' || art.category === selectedCategory;
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="page-enter blog-page">
      {/* Welcome Area */}
      <section className="blog-welcome card animate-fade-in-up">
        <div className="blog-welcome-content">
          <div className="blog-welcome-badge">
            <Sparkles size={14} />
            <span>Guia de Estilo & Saúde</span>
          </div>
          <h1 className="heading-lg mt-sm">Blog de Cuidados BarberPro</h1>
          <p className="text-body text-muted">
            Dicas práticas de lavagem, cuidados contra queda, identificação de tipos de cabelo e tendências de estilo.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="blog-filter-row animate-fade-in-up">
        {/* Search */}
        <div className="input-with-icon blog-search">
          <Search size={18} className="input-icon" />
          <input
            type="text"
            className="input"
            placeholder="Pesquisar artigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Chips */}
        <div className="blog-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`blog-cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="blog-grid stagger-children mt-lg">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((art) => (
            <div
              className="blog-card card clickable-card animate-scale-in"
              key={art.id}
              onClick={() => setSelectedArticle(art)}
            >
              <div className="blog-card-visual">
                <span className="blog-card-emoji">{art.imageIcon}</span>
                <span className="blog-card-category">{art.category}</span>
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="meta-item"><Clock size={12} /> {art.readTime} de leitura</span>
                </div>
                <h3 className="blog-card-title">{art.title}</h3>
                <p className="blog-card-summary text-muted">{art.summary}</p>
                <div className="blog-card-footer">
                  <span className="read-more-link">
                    Ler artigo completo
                    <BookOpen size={14} style={{ marginLeft: '6px' }} />
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <BookOpen size={48} />
            <h3>Nenhum artigo encontrado</h3>
            <p>Tente buscar por outras palavras-chave ou limpar os filtros.</p>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="modal blog-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="blog-modal-header">
              <button className="btn-icon btn-ghost blog-modal-close" onClick={() => setSelectedArticle(null)} aria-label="Fechar">
                <X size={20} />
              </button>
              <span className="blog-modal-category">{selectedArticle.category}</span>
            </div>
            <div className="blog-modal-body">
              <div className="blog-modal-title-row">
                <span className="blog-modal-emoji">{selectedArticle.imageIcon}</span>
                <div>
                  <h2 className="heading-md">{selectedArticle.title}</h2>
                  <span className="meta-item mt-xs block"><Clock size={12} /> {selectedArticle.readTime} de leitura</span>
                </div>
              </div>
              <div className="divider" style={{ margin: '20px 0' }} />
              <div className="blog-modal-content">
                {selectedArticle.content.split('\n\n').map((para, idx) => {
                  if (para.startsWith('**') && para.includes('**')) {
                    // Handle sub-headings
                    const cleanPara = para.replace(/\*\*/g, '');
                    return <h4 key={idx} style={{ color: 'var(--accent-primary)', marginTop: '16px', fontSize: '1rem', fontWeight: 'bold' }}>{cleanPara}</h4>;
                  }
                  // Render basic formatting for list styles inside content
                  const lines = para.split('\n');
                  return (
                    <p key={idx} style={{ lineHeight: '1.6', marginBottom: '14px', fontSize: '0.9375rem' }}>
                      {lines.map((line, lIdx) => {
                        const isBullet = line.startsWith('- ');
                        const content = line.replace(/^- /, '');
                        // Handle bold text inline
                        const parts = content.split(/(\*[^*]+\*)/g);
                        const formattedParts = parts.map((part, pIdx) => {
                          if (part.startsWith('*') && part.endsWith('*')) {
                            return <i key={pIdx}>{part.slice(1, -1)}</i>;
                          }
                          return part;
                        });

                        return (
                          <span key={lIdx}>
                            {lIdx > 0 && <br />}
                            {isBullet ? '• ' : ''}
                            {formattedParts}
                          </span>
                        );
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
            <div className="blog-modal-footer">
              <button className="btn btn-secondary btn-full" onClick={() => setSelectedArticle(null)}>
                Fechar Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
