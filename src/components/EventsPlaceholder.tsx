import foliumIcon from '@/assets/folium-icon.svg';

export default function EventsPlaceholder() {
  return (
    <div className="min-h-[calc(100vh-8rem)] pb-24 px-6 flex flex-col items-center justify-center text-center animate-fade-in">
      <img src={foliumIcon} alt="Codex" className="h-14 w-14 mb-5 [filter:sepia(1)_saturate(2)_hue-rotate(358deg)]" />
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground font-['Josefin_Sans']">
        Brevemente — eventos de leitura, grupos e novidades da tua escola e distrito.
      </p>
    </div>
  );
}
