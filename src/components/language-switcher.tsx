import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'kz', name: 'Қазақша', flag: '🇰🇿' }
];

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useTranslation();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-xl border-slate-200/50 hover:from-slate-100/95 hover:to-gray-100/95 shadow-lg hover:shadow-xl transition-all duration-300 gap-2 font-medium"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <Globe className="h-3 w-3 text-white" />
          </div>
          <span className="hidden sm:inline text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
            {currentLang.flag} {currentLang.name}
          </span>
          <span className="sm:hidden text-slate-700 group-hover:text-slate-800 transition-colors duration-300">
            {currentLang.flag}
          </span>
          <ChevronDown className="h-3 w-3 text-slate-500 group-hover:text-slate-600 transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-gradient-to-br from-slate-50/95 to-white/95 backdrop-blur-xl border-slate-200/50 shadow-2xl rounded-2xl p-2"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-100/95 hover:to-purple-100/95 hover:shadow-lg ${
              currentLanguage === lang.code 
                ? 'bg-gradient-to-r from-indigo-100/95 to-purple-100/95 shadow-lg border border-indigo-200/50' 
                : ''
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
                currentLanguage === lang.code
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500'
              }`}>
                <span className="text-xs">{lang.flag}</span>
              </div>
              <span className={`font-medium transition-colors duration-300 ${
                currentLanguage === lang.code
                  ? 'text-indigo-700'
                  : 'text-slate-700 group-hover:text-slate-800'
              }`}>
                {lang.name}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
