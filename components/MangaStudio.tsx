
import React, { useState, useEffect } from 'react';
import { MangaProject, MangaPage, MangaPanel, GeneratedImage, MangaCharacter, StoredUser } from '../types.ts';
import { PlusIcon, TrashIcon, SparklesIcon, UsersIcon, BookOpenIcon, PencilIcon } from './Icons.tsx';
import { useImageGeneration } from '../hooks/useImageGeneration.ts';
import CharacterModal from './CharacterModal.tsx';
import ConfirmModal from './ConfirmModal.tsx';
import { soundManager, Sfx } from '../lib/sounds.ts';
import { t } from '../lib/i18n.ts';
import * as db from '../lib/db.ts';

interface MangaStudioProps {
  onGenerate: (prompt: string, options?: { aspectRatio?: string }) => Promise<GeneratedImage>;
  user: StoredUser | null;
}

type DeletionTarget = { type: 'project', id: string } | { type: 'character', id: string } | null;


const TabButton: React.FC<{ icon: React.ReactNode, children: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, children, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold transition-colors ${active ? 'bg-slate-700/50 text-cyan-400' : 'text-slate-400 hover:bg-slate-700/20'}`}>
        {icon}{children}
    </button>
);


const MangaStudio: React.FC<MangaStudioProps> = ({ onGenerate, user }) => {
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [activeProject, setActiveProject] = useState<MangaProject | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'pages' | 'characters'>('pages');
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<MangaCharacter | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');
  const [deletionTarget, setDeletionTarget] = useState<DeletionTarget>(null);

  const { isLoading: isPanelGenerating, error: panelError, generateImage: generatePanelImage } = useImageGeneration(onGenerate);

  // Load projects from IndexedDB on user change
  useEffect(() => {
    const loadProjects = async () => {
      if (user) {
        const loadedProjects = await db.getProjects();
        setProjects(loadedProjects);
      } else {
        setProjects([]);
      }
    };
    
    setActiveProject(null);
    setSelectedPageId(null);
    setSelectedPanelId(null);
    loadProjects();
  }, [user]);

  // Save projects to IndexedDB whenever they change
  useEffect(() => {
    if (user && projects.length > 0) {
      db.saveProjects(projects);
    }
  }, [projects, user]);

  // Reset title editing state when active project changes
  useEffect(() => {
    if (activeProject) {
        setIsEditingTitle(false);
        setEditingTitleValue(activeProject.title);
    }
  }, [activeProject?.id]);


  const createNewProject = () => {
    const baseTitle = t('mangaStudio.untitledProjectBase');
    const untitledProjects = projects.filter(p => p.title.startsWith(baseTitle));
    const existingNumbers = untitledProjects
        .map(p => {
            const numStr = p.title.substring(baseTitle.length).trim();
            return numStr === '' && p.title === baseTitle ? 1 : parseInt(numStr, 10);
        })
        .filter(n => !isNaN(n));
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;

    const newProject: MangaProject = {
      id: `proj_${Date.now()}`,
      title: `${baseTitle} ${maxNumber + 1}`,
      characters: [],
      pages: [],
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    soundManager.play(Sfx.Add);
  };
  
  const confirmDeletion = (target: DeletionTarget) => {
    soundManager.play(Sfx.Click);
    setDeletionTarget(target);
  };

  const executeDeletion = () => {
    if (!deletionTarget) return;

    soundManager.play(Sfx.Delete);

    if (deletionTarget.type === 'project') {
        const updatedProjects = projects.filter(p => p.id !== deletionTarget.id);
        setProjects(updatedProjects);
        if (activeProject?.id === deletionTarget.id) {
            setActiveProject(null);
            setSelectedPageId(null);
            setSelectedPanelId(null);
        }
    } else if (deletionTarget.type === 'character' && activeProject) {
        const updatedCharacters = activeProject.characters.filter(c => c.id !== deletionTarget.id);
        const updatedProject = { ...activeProject, characters: updatedCharacters };
        updateActiveProjectState(updatedProject);
    }
    
    setDeletionTarget(null);
  };
  
  // --- Project State Updaters ---
  const updateActiveProjectState = (updatedProject: MangaProject) => {
    const projectWithTimestamp = { ...updatedProject, updatedAt: new Date().toISOString() };
    setActiveProject(projectWithTimestamp);
    setProjects(projects.map(p => p.id === projectWithTimestamp.id ? projectWithTimestamp : p));
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
        updatePanel(selectedPanelId, { image: generatedImage as any });
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitleValue(e.target.value);
  };

  const handleTitleSave = () => {
    if (!activeProject || !editingTitleValue.trim()) {
        setEditingTitleValue(activeProject?.title || '');
        setIsEditingTitle(false);
        return;
    };
    const updatedProject = { ...activeProject, title: editingTitleValue.trim() };
    updateActiveProjectState(updatedProject);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleTitleSave();
    } else if (e.key === 'Escape') {
        setEditingTitleValue(activeProject?.title || '');
        setIsEditingTitle(false);
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
                avatarUrl: characterData.avatarUrl!
            };
            updatedCharacters = [...activeProject.characters, newCharacter];
        }

        const updatedProject = { ...activeProject, characters: updatedCharacters };
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
            <div className="flex items-center gap-3 group min-w-0">
                {isEditingTitle ? (
                     <input
                        type="text"
                        value={editingTitleValue}
                        onChange={handleTitleChange}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        className="text-2xl font-bold bg-slate-700 text-cyan-400 rounded-md px-2 -mx-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        autoFocus
                        onFocus={(e) => e.target.select()}
                    />
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-cyan-400 truncate">{activeProject.title}</h1>
                        <button onClick={() => setIsEditingTitle(true)} title="Edit title" className="text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity flex-shrink-0">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>
            <button onClick={() => { soundManager.play(Sfx.Click); setActiveProject(null); setSelectedPageId(null); setSelectedPanelId(null); }} className="text-slate-300 hover:text-white flex-shrink-0 ml-4">
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
                            {activeProject.characters.length > 0 ? (
                                activeProject.characters.map(char => (
                                    <div key={char.id} className="group flex items-center space-x-3 p-2 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer" onClick={() => openEditCharacterModal(char)}>
                                        <img src={char.avatarUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-slate-500" alt={char.name} />
                                        <div className="flex-grow truncate">
                                            <p className="font-semibold text-sm text-white truncate">{char.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{char.description}</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); confirmDeletion({ type: 'character', id: char.id }); }} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full text-center text-slate-500 text-sm p-4">
                                  {t('mangaStudio.noCharacters')}
                                </div>
                            )}
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
        {deletionTarget && <ConfirmModal 
            title={deletionTarget.type === 'project' ? t('mangaStudio.deleteProject') : t('mangaStudio.deleteCharacter')}
            message={deletionTarget.type === 'project' ? t('mangaStudio.confirmDeleteProject') : t('mangaStudio.confirmDeleteCharacter')}
            onConfirm={executeDeletion}
            onCancel={() => setDeletionTarget(null)}
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
          projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(proj => (
            <div key={proj.id} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors group flex flex-col">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{t('mangaStudio.lastUpdated')}: {new Date(proj.updatedAt).toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button 
                  onClick={() => { soundManager.play(Sfx.Click); setActiveProject(proj); }}
                  className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-500 transition-colors"
                >
                  {t('mangaStudio.openEditor')}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); confirmDeletion({ type: 'project', id: proj.id }) }}
                  title={t('mangaStudio.deleteProject')}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 -m-2"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
       {deletionTarget && <ConfirmModal 
            title={t('mangaStudio.deleteProject')}
            message={t('mangaStudio.confirmDeleteProject')}
            onConfirm={executeDeletion}
            onCancel={() => setDeletionTarget(null)}
        />}
    </div>
  );
};

export default MangaStudio;