// Empty, explicit PostCSS config for this project.
//
// Vite resolves PostCSS config by searching upward from the project
// directory. Without a config here, that search can reach an unrelated
// postcss.config.js higher up the filesystem (e.g. a different project's
// Tailwind setup) and break this project's build. Declaring our own
// (empty) config stops that search — we don't use PostCSS plugins.
export default {
  plugins: {},
};
