/**
 * Inline <head> script: adds `html.js-motion` before first paint so motion start states
 * apply without a flash. If the motion code hasn't booted within 4s (slow network, JS
 * error), the class is removed and all content shows unanimated.
 */
const script = `(function(d,w){d.documentElement.classList.add('js-motion');setTimeout(function(){if(!w.__motionReady)d.documentElement.classList.remove('js-motion')},4000)})(document,window)`;

export function MotionScript() {
  return <script id="js-motion" dangerouslySetInnerHTML={{ __html: script }} />;
}
