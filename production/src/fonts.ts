import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600-italic.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import {continueRender, delayRender} from 'remotion';

if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  const families = [
    '500 40px Cinzel', '700 40px Cinzel', '900 40px Cinzel',
    '500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', 'italic 500 40px "Cormorant Garamond"', 'italic 600 40px "Cormorant Garamond"',
    '700 40px "Playfair Display"',
    '400 40px Montserrat', '500 40px Montserrat', '600 40px Montserrat', '700 40px Montserrat', '800 40px Montserrat',
  ];
  Promise.all(families.map((ff) => document.fonts.load(ff)))
    .then(() => document.fonts.ready)
    .then(() => continueRender(h))
    .catch(() => continueRender(h));
}
