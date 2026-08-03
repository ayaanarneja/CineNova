<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const email = ref('demo@cinenova.com')
const password = ref('demo1234')
const showPassword = ref(false)
const formRef = ref(null)
const cardRef = ref(null)

const rules = {
  required: (v) => !!v || 'Required',
  email: (v) => /.+@.+\..+/.test(v) || 'Enter a valid email'
}

onMounted(() => {
  gsap.fromTo(cardRef.value, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
})

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await auth.login({ email: email.value, password: password.value })
    toast.success('Welcome back!')
    router.push(route.query.redirect || '/')
  } catch (err) {
    toast.error(err.message)
  }
}
</script>

<template>
  <div class="auth-page d-flex align-center justify-center">
    <v-card ref="cardRef" class="glass-card pa-8 auth-card" elevation="0">
      <div class="text-center mb-6">
        <v-img src="/brand/cinenova-lockup.png" max-width="220" class="mx-auto login-logo" rounded="xl" />
        <p class="text-caption text-medium-emphasis mt-2">Sign in to book your next show</p>
      </div>

      <v-form ref="formRef" @submit.prevent="submit">
        <v-text-field
          v-model="email"
          label="Email address"
          prepend-inner-icon="mdi-email-outline"
          :rules="[rules.required, rules.email]"
          class="mb-2"
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required]"
          class="mb-2"
        />

        <v-alert v-if="auth.error" type="error" variant="tonal" density="compact" class="mb-4">
          {{ auth.error }}
        </v-alert>

        <v-btn
          block
          size="large"
          class="neon-btn mt-2"
          type="submit"
          :loading="auth.loading"
        >
          Sign In
        </v-btn>

        <div class="text-caption text-center text-medium-emphasis mt-4">
          Demo credentials pre-filled — just hit Sign In
        </div>

        <v-divider class="my-5" />

        <div class="text-center text-body-2">
          New to CineNova?
          <router-link to="/register" class="text-primary font-weight-medium ml-1">Create an account</router-link>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.login-logo {
  filter: drop-shadow(0 0 16px rgba(177,92,255,0.35));
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.auth-page {
  min-height: 100vh;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
}
</style>
