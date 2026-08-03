import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const cineNovaDark = {
  dark: true,
  colors: {
    background: '#050505',
    surface: '#0B0B0F',
    'surface-bright': '#16161D',
    primary: '#B15CFF',
    secondary: '#FF4DA6',
    accent: '#00E5C7',
    error: '#FF5C7A',
    info: '#5CC8FF',
    success: '#4DFFB0',
    warning: '#FFC24D',
    'on-background': '#F2ECFF',
    'on-surface': '#F2ECFF'
  }
}

const cineNovaLight = {
  dark: false,
  colors: {
    background: '#F5F3FB',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    primary: '#8B3DF0',
    secondary: '#E8368F',
    accent: '#00A98F',
    error: '#E0324F',
    info: '#2B8FD6',
    success: '#1FAE6F',
    warning: '#C97F00',
    'on-background': '#171226',
    'on-surface': '#171226'
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'cineNovaDark',
    themes: { cineNovaDark, cineNovaLight }
  },
  defaults: {
    VBtn: { rounded: 'xl', style: 'text-transform:none; letter-spacing:0.2px;' },
    VCard: { rounded: 'xl' },
    VTextField: { variant: 'outlined', rounded: 'lg', density: 'comfortable' },
    VSelect: { variant: 'outlined', rounded: 'lg', density: 'comfortable' },
    VChip: { rounded: 'lg' }
  }
})
