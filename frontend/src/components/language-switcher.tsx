import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { useI18n } from '../features/i18n/i18n-context';
import type { AppLanguage } from '../features/i18n/i18n-copy';

export function LanguageSwitcher() {
  const { language, setLanguage, copy } = useI18n();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={language}
      aria-label={copy.languageSwitcher.label}
      onChange={(_, nextLanguage: AppLanguage | null) => {
        if (nextLanguage) {
          setLanguage(nextLanguage);
        }
      }}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderRadius: 3,
      }}
    >
      <ToggleButton value="ru">{copy.languageSwitcher.ru}</ToggleButton>
      <ToggleButton value="en">{copy.languageSwitcher.en}</ToggleButton>
    </ToggleButtonGroup>
  );
}
