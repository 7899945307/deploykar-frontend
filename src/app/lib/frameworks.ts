import { FrontendFramework } from './types';

export const frontendFrameworks: FrontendFramework[] = [
  {
    id: 'react',
    name: 'React',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    color: '#61DAFB',
    buildCommand: 'npm run build',
    outputDir: 'build',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    color: '#FFFFFF',
    buildCommand: 'npm run build',
    outputDir: '.next',
  },
  {
    id: 'angular',
    name: 'Angular',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    color: '#DD0031',
    buildCommand: 'ng build',
    outputDir: 'dist',
  },
  {
    id: 'vue',
    name: 'Vue',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    color: '#4FC08D',
    buildCommand: 'npm run build',
    outputDir: 'dist',
  },
  {
    id: 'svelte',
    name: 'Svelte',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
    color: '#FF3E00',
    buildCommand: 'npm run build',
    outputDir: 'public/build',
  },
];

export const getFrameworkById = (id: string): FrontendFramework | undefined => {
  return frontendFrameworks.find((f) => f.id === id);
};
