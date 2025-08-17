import React, { useState } from 'react';
import { MangaProject, MangaPage, MangaPanel, GeneratedImage, MangaCharacter } from '../types';
import { PlusIcon, TrashIcon, SparklesIcon, UsersIcon, BookOpenIcon } from './Icons';
import { useImageGeneration } from '../hooks/useImageGeneration';
import CharacterModal from './CharacterModal';
import { soundManager, Sfx } from '../lib/sounds';
import { t } from '../lib/i18n';

interface MangaStudioProps {
  onGenerate: (prompt: string, options?: { aspectRatio?: string }) => Promise<GeneratedImage>;
}

const TabButton: React.FC<{ icon: React.ReactNode, children: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, children, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold transition-colors ${active ? 'bg-slate-700/50 text-cyan-400' : 'text-slate-400 hover:bg-slate-700/20'}`}>
        {icon}{children}
    </button>
);


const MangaStudio: React.FC<MangaStudioProps> = ({ onGenerate }) => {
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [activeProject, setActiveProject] = useState<MangaProject | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'pages' | 'characters'>('pages');
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<MangaCharacter | null>(null);

  const { isLoading: isPanelGenerating, error: panelError, generateImage: generatePanelImage } = useImageGeneration(onGenerate);

  const createNewProject = () => {
    const newProject: MangaProject = {
      id: `proj_${Date.now()}`,
      title: t('mangaStudio.untitledProject'),
      characters: [],
      pages: [],
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    soundManager.play(Sfx.Add);
  };
  
  // --- Project State Updaters ---
  const updateActiveProjectState = (updatedProject: MangaProject) => {
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const addPage = () => {
    if (!activeProject) return;
    const newPage: MangaPage = { id: `page_${Date.now()}`, panels: [], layout: '2x2' };
    const updatedProject = { ...activeProject, pages: [...activeProject.pages, newPage]};
    updateActiveProjectState(updatedProject);
    setSelectedPageId(newPage.id);
    soundManager.play(Sfx.Add);
  };

  const addPanel = () => {
    if (!activeProject || !selectedPageId) return;
    const newPanel: MangaPanel = { id: `panel_${Date.now()}`, image: null, dialogue: '' };
    const updatedProject = {
      ...activeProject,
      pages: activeProject.pages.map(p => 
        p.id === selectedPageId ? { ...p, panels: [...p.panels, newPanel] } : p
      )
    };
    updateActiveProjectState(updatedProject);
    soundManager.play(Sfx.Add);
  };
  
  const updatePanel = (panelId: string, updates: Partial<MangaPanel>) => {
    if (!activeProject || !selectedPageId) return;
    const updatedProject = {
        ...activeProject,
        pages: activeProject.pages.map(p => 
            p.id === selectedPageId ? { 
                ...p, 
                panels: p.panels.map(panel => 
                    panel.id === panelId ? { ...panel, ...updates } : panel
                )
            } : p
        )
    };
    updateActiveProjectState(updatedProject);
  };

  const handlePanelGenerate = async (prompt: string) => {
    if (!selectedPanelId) return;
    const generatedImage = await generatePanelImage(prompt, { aspectRatio: '1:1' });
    if(generatedImage) {
        updatePanel(selectedPanelId, { image: generatedImage as any }); // Type assertion to fit
    }
  };

  // --- Character Functions ---
    const handleSaveCharacter = (characterData: Omit<MangaCharacter, 'id'> & { id?: string }) => {
        if (!activeProject) return;
        
        let updatedCharacters: MangaCharacter[];
        if (characterData.id) { // Editing existing character
            updatedCharacters = activeProject.characters.map(c => c.id === characterData.id ? { ...c, ...characterData, id: c.id } : c);
        } else { // Adding new character
            const newCharacter: MangaCharacter = {
                ...characterData,
                id: `char_${Date.now()}`,
                avatarUrl: characterData.avatarUrl! // It will be defined by this point
            };
            updatedCharacters = [...activeProject.characters, newCharacter];
        }

        const updatedProject = {
            ...activeProject,
            characters: updatedCharacters,
            updatedAt: new Date().toISOString()
        };
        updateActiveProjectState(updatedProject);
        closeCharacterModal();
    };
    
    const openNewCharacterModal = () => {
        setCharacterToEdit(null);
        setIsCharacterModalOpen(true);
    };
    
    const openEditCharacterModal = (character: MangaCharacter) => {
        setCharacterToEdit(character);
        setIsCharacterModalOpen(true);
        soundManager.play(Sfx.Open);
    };
    
    const closeCharacterModal = () => {
        setIsCharacterModalOpen(false);
        setCharacterToEdit(null);
    };
    
    const deleteCharacter = (characterId: string) => {
        if (!activeProject || !window.confirm(t('mangaStudio.confirmDeleteCharacter'))) return;
        const updatedCharacters = activeProject.characters.filter(c => c.id !== characterId);
        const updatedProject = { ...activeProject, characters: updatedCharacters, updatedAt: new Date().toISOString() };
        updateActiveProjectState(updatedProject);
        soundManager.play(Sfx.Delete);
    };
    
    const handleAddCharacterToPrompt = (character: MangaCharacter) => {
        if (!selectedPanelId || !selectedPanel) return;
        const currentPrompt = selectedPanel.image?.prompt || '';
        const characterPrompt = `${character.name} (${character.description})`;
        const newPrompt = currentPrompt ? `${currentPrompt}, ${characterPrompt}` : characterPrompt;

        updatePanel(selectedPanelId, {
            image: {
                ...(selectedPanel.image || { id: '', url: '', createdAt: new Date().toISOString() }),
                prompt: newPrompt
            } as GeneratedImage
        });
        soundManager.play(Sfx.Click);
    };

    const handleSelectPage = (pageId: string) => {
      setSelectedPageId(pageId);
      setSelectedPanelId(null);
      soundManager.play(Sfx.Click);
    }
  
    const handleSelectPanel = (panelId: string) => {
      setSelectedPanelId(panelId);
      soundManager.play(Sfx.Click);
    }
    
    const handleTabChange = (tab: 'pages' | 'characters') => {
      setActiveSidebarTab(tab);
      soundManager.play(Sfx.Switch);
    }
  
    const handleOpenNewCharacterModal = () => {
        openNewCharacterModal();
        soundManager.play(Sfx.Open);
    }
  
    const selectedPage = activeProject?.pages.find(p => p.id === selectedPageId);
    const selectedPanel = selectedPage?.panels.find(p => p.id === selectedPanelId);


  if (activeProject) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h1 className="text-2xl font-bold text-cyan-400 truncate pr-4">{activeProject.title}</h1>
            <button onClick={() => { soundManager.play(Sfx.Click); setActiveProject(null); setSelectedPageId(null); setSelectedPanelId(null); }} className="text-slate-300 hover:text-white flex-shrink-0">
                &larr; {t('mangaStudio.backToProjects')}
            </button>
        </div>
        
        <div className="grid grid-cols-12 gap-4 flex-grow min-h-0">
            {/* Pages & Characters Sidebar */}
            <div className="col-span-3 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col">
                <div className="flex border-b border-slate-700 flex-shrink-0">
                    <TabButton icon={<BookOpenIcon className="w-5 h-5 mr-2" />} active={activeSidebarTab === 'pages'} onClick={() => handleTabChange('pages')}>{t('mangaStudio.pages')}</TabButton>
                    <TabButton icon={<UsersIcon className="w-5 h-5 mr-2" />} active={activeSidebarTab === 'characters'} onClick={() => handleTabChange('characters')}>{t('mangaStudio.characters')}</TabButton>
                </div>

                {activeSidebarTab === 'pages' && (
                    <div className="p-4 flex flex-col flex-grow min-h-0">
                        <div className="space-y-2 overflow-y-auto flex-grow">
                            {activeProject.pages.map((page, index) => (
                                <div key={page.id} onClick={() => handleSelectPage(page.id)} 
                                className={`p-2 rounded cursor-pointer ${selectedPageId === page.id ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    {t('mangaStudio.page')} {index + 1}
                                </div>
                            ))}
                        </div>
                        <button onClick={addPage} className="mt-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors w-full flex items-center justify-center">
                            <PlusIcon className="w-5 h-5 mr-2" />{t('mangaStudio.newPage')}
                        </button>
                    </div>
                )}

                {activeSidebarTab === 'characters' && (
                    <div className="p-4 flex flex-col flex-grow min-h-0">
                        <div className="space-y-3 overflow-y-auto flex-grow pr-1">
                            {activeProject.characters.map(char => (
                                <div key={char.id} className="group flex items-center space-x-3 p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => openEditCharacterModal(char)}>
                                    <img src={char.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-500" alt={char.name} />
                                    <div className="flex-grow truncate">
                                        <p className="font-semibold text-sm text-white truncate">{char.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{char.description}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id); }} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleOpenNewCharacterModal} className="mt-4 bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors w-full flex items-center justify-center">
                           <PlusIcon className="w-5 h-5 mr-2" />{t('mangaStudio.newCharacter')}
                        </button>
                    </div>
                )}
            </div>

            {/* Canvas */}
            <div className="col-span-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-y-auto">
                {selectedPage ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            {selectedPage.panels.map(panel => (
                                <div key={panel.id} onClick={() => handleSelectPanel(panel.id)} className={`aspect-square rounded border-2 transition-colors ${selectedPanelId === panel.id ? 'border-cyan-400' : 'border-slate-600'} bg-slate-800 cursor-pointer overflow-hidden`}>
                                    {panel.image ? <img src={panel.image.url} alt={panel.image.prompt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500">{t('mangaStudio.emptyPanel')}</div>}
                                </div>
                            ))}
                        </div>
                        <button onClick={addPanel} className="mt-4 bg-slate-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors w-full">
                           <PlusIcon className="w-5 h-5 inline-block mr-2" />{t('mangaStudio.addPanel')}
                        </button>
                    </>
                ) : <div className="flex items-center justify-center h-full text-slate-400">{t('mangaStudio.selectPage')}</div>}
            </div>

            {/* Inspector */}
            <div className="col-span-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col min-h-0">
                <h2 className="text-lg font-bold mb-3 text-white flex-shrink-0">{t('mangaStudio.inspector')}</h2>
                <div className="overflow-y-auto flex-grow">
                {selectedPanel ? (
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">{t('mangaStudio.panelPrompt')}</label>
                            <textarea
                                placeholder={t('mangaStudio.panelPromptPlaceholder')}
                                rows={4}
                                value={selectedPanel.image?.prompt || ''}
                                onChange={(e) => {
                                    const newPrompt = e.target.value;
                                    updatePanel(selectedPanel.id, {
                                        image: {
                                            ...(selectedPanel.image || { id: '', url: '', createdAt: new Date().toISOString() }),
                                            prompt: newPrompt,
                                        } as GeneratedImage
                                    });
                                }}
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-sm font-semibold text-slate-300 mb-2">{t('mangaStudio.addCharacterToPrompt')}</h3>
                            {activeProject.characters.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {activeProject.characters.map(char => (
                                        <button
                                            key={char.id}
                                            onClick={() => handleAddCharacterToPrompt(char)}
                                            className="flex items-center bg-slate-700 text-xs text-slate-200 pl-1 pr-2 py-1 rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
                                            title={char.description}
                                        >
                                            <img src={char.avatarUrl} className="w-5 h-5 rounded-full object-cover mr-1.5" alt={char.name}/>
                                            <span>{char.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500">{t('mangaStudio.createCharacterHint')}</p>
                            )}
                        </div>
                        <button
                          onClick={() => handlePanelGenerate(selectedPanel.image?.prompt || '')}
                          disabled={isPanelGenerating || !selectedPanel.image?.prompt}
                          className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-cyan-600 disabled:bg-slate-600"
                        >
                            {isPanelGenerating ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                            <span>{t('mangaStudio.generateImage')}</span>
                        </button>
                        {panelError && <p className="text-red-400 text-sm">{panelError}</p>}
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-1">{t('mangaStudio.dialogue')}</label>
                            <textarea
                                placeholder={t('mangaStudio.dialoguePlaceholder')}
                                rows={3}
                                value={selectedPanel.dialogue}
                                onChange={(e) => updatePanel(selectedPanel.id, { dialogue: e.target.value })}
                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>
                ) : <div className="text-slate-400">{t('mangaStudio.selectPanel')}</div>}
                </div>
            </div>
        </div>
        {isCharacterModalOpen && <CharacterModal 
            onClose={closeCharacterModal} 
            onSave={handleSaveCharacter}
            characterToEdit={characterToEdit}
            onGenerate={onGenerate}
        />}
      </div>
    );
  }

  // Project Selection View
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold text-cyan-400">{t('mangaStudio.title')}</h1>
        <button
          onClick={createNewProject}
          className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-cyan-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>{t('mangaStudio.newProject')}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-lg col-span-full">
            <p className="text-slate-400">{t('mangaStudio.noProjects')}</p>
          </div>
        ) : (
          projects.map(proj => (
            <div key={proj.id} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors group">
              <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{t('mangaStudio.lastUpdated')}: {new Date(proj.updatedAt).toLocaleString()}</p>
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => { soundManager.play(Sfx.Click); setActiveProject(proj); }}
                  className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors"
                >
                  {t('mangaStudio.openEditor')}
                </button>
                <button className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MangaStudio;