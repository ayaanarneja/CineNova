<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const showPassword = ref(false)
const formRef = ref(null)
const cardRef = ref(null)

const rules = {
  required: (v) => !!v || 'Required',
  email: (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
  phone: (v) => (!v || /^\d{10}$/.test(v)) || 'Enter a valid 10-digit phone',
  password: (v) => (v && v.length >= 6) || 'Minimum 6 characters'
}

onMounted(() => {
  gsap.fromTo(cardRef.value, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
})

async function submit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    await auth.register({ name: name.value, email: email.value, phone: phone.value, password: password.value })
    toast.success('Account created! Welcome to CineNova.')
    router.push('/')
  } catch (err) {
    toast.error(err.message)
  }
}
</script>

<template>
  <div class="auth-page d-flex align-center justify-center">
    <v-card ref="cardRef" class="glass-card pa-8 auth-card" elevation="0">
      <div class="text-center mb-6">
        <v-icon color="secondary" size="42">mdi-account-star</v-icon>
        <h1 class="text-h5 gradient-text mt-2">Create Account</h1>
        <p class="text-caption text-medium-emphasis">Join CineNova and never miss a show</p>
      </div>

      <v-form ref="formRef" @submit.prevent="submit">
        <v-text-field v-model="name" label="Full name" prepend-inner-icon="mdi-account-outline" :rules="[rules.required]" class="mb-2" />
        <v-text-field v-model="email" label="Email address" prepend-inner-icon="mdi-email-outline" :rules="[rules.required, rules.email]" class="mb-2" />
        <v-text-field v-model="phone" label="Phone number" prepend-inner-icon="mdi-phone-outline" :rules="[rules.phone]" class="mb-2" />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required, rules.password]"
          class="mb-2"
        />

        <v-alert v-if="auth.error" type="error" variant="tonal" density="compact" class="mb-4">
          {{ auth.error }}
        </v-alert>

        <v-btn block size="large" class="neon-btn mt-2" type="submit" :loading="auth.loading">
          Create Account
        </v-btn>

        <v-divider class="my-5" />

        <div class="text-center text-body-2">
          Already have an account?
          <router-link to="/login" class="text-primary font-weight-medium ml-1">Sign in</router-link>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 440px;
}
</style>
