import React, { useState } from 'react';
import { Download, Maximize2, Wand2, SlidersHorizontal, Trash2, X, Sparkles } from 'lucide-react';
import { HeadshotItem } from '../types';

interface HeadshotGalleryProps {
  items: HeadshotItem[];
  onSelectForEdit: (item: HeadshotItem) => void;
  onSelectForCompare: (item: HeadshotItem) => void;
  onDeleteItem: (id: string) => void;
}

export const HeadshotGallery: React.FC<HeadshotGalleryProps> = ({
  items,
  onSelectForEdit,
  onSelectForCompare,
  onDeleteItem,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; meta: string } | null>(null);

  const downloadImage = (imageUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Headshot Portfolio Gallery</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Your generated studio sessions and prompt edits. Stored locally in your browser.
          </p>
        </div>
        <div className="text-xs text-zinc-400">
          <span>{items.length} {items.length === 1 ? 'Portait' : 'Portraits'} Available</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 border border-dashed border-zinc-800 rounded-xl">
          <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-300">No Headshots Generated Yet</p>
          <p className="text-xs text-zinc-400 mt-1">
            Upload your casual selfie and select a style above to generate your first executive portrait.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => {
            const currentDisplayUrl = item.edits.length > 0 
              ? item.edits[item.edits.length - 1].imageUrl 
              : item.generatedImageUrl;
            const hasEdits = item.edits.length > 0;

            return (
              <div
                key={item.id}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col justify-between hover:border-zinc-700 transition-all duration-200 shadow-md"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={currentDisplayUrl}
                    alt={item.styleName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-amber-400 border border-amber-500/20">
                      {item.styleName}
                    </span>
                    {hasEdits && (
                      <span className="text-[10px] font-medium bg-zinc-800/80 backdrop-blur-md px-1.5 py-0.5 rounded text-zinc-300">
                        {item.edits.length} {item.edits.length === 1 ? 'edit' : 'edits'}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Action Bar */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="View Fullscreen"
                      onClick={() =>
                        setLightboxImage({
                          url: currentDisplayUrl,
                          title: item.styleName,
                          meta: `${item.attire} · ${item.aspectRatio}`,
                        })
                      }
                      className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 shadow-lg transition-transform hover:scale-105"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Compare with Selfie"
                      onClick={() => onSelectForCompare(item)}
                      className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 border border-zinc-700 shadow-lg transition-transform hover:scale-105"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="AI Prompt Retouch"
                      onClick={() => onSelectForEdit(item)}
                      className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700 shadow-lg transition-transform hover:scale-105"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Download Headshot"
                      onClick={() =>
                        downloadImage(
                          currentDisplayUrl,
                          `AuraStudio_${item.styleId}_${Date.now()}.png`
                        )
                      }
                      className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg transition-transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 text-xs space-y-1 bg-zinc-950">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="font-semibold truncate">{item.styleName}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="text-zinc-400 hover:text-rose-400 transition-colors p-0.5"
                      title="Delete from session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {item.attire}
                  </p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800/80">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span>{item.aspectRatio} · {item.modelUsed}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-white">{lightboxImage.title}</h3>
                <p className="text-xs text-zinc-400">{lightboxImage.meta}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadImage(lightboxImage.url, `AuraStudio_HD_${Date.now()}.png`)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download High-Res</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)]">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
