<script setup>
// Admin Dashboard: search, add, edit, delete movies.
// Uses the shared movies Pinia store (which talks to json-server through
// movieService) so the catalogue stays in sync with the rest of the app.
import { ref, computed, onMounted } from 'vue'
import { useMoviesStore } from '@/stores/movies'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages } from '@/composables/useImageFallback'

const movies = useMoviesStore()
const toast = useToastStore()
const { resolve: resolvePoster, markBroken: markPosterBroken } = useBrokenImages()

const search = ref('')
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingId = ref(null)
const targetToDelete = ref(null)

const emptyForm = () => ({
  title: '',
  genre: '',
  language: '',
  duration: 120,
  rating: 4.0,
  censor: 'UA',
  releaseDate: new Date().toISOString().slice(0, 10),
  status: 'now_playing',
  description: '',
  director: '',
  poster: '',
  backdrop: '',
  trending: false,
  topRated: false
})

const form = ref(emptyForm())
const formErrors = ref({})

const statusOptions = [
  { title: 'Now Playing', value: 'now_playing' },
  { title: 'Coming Soon', value: 'coming_soon' }
]

onMounted(() => {
  movies.fetchAll()
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return movies.all
  return movies.all.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.genre?.some((g) => g.toLowerCase().includes(q)) ||
      m.status?.toLowerCase().includes(q)
  )
})

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formErrors.value = {}
  dialogOpen.value = true
}

function openEdit(movie) {
  editingId.value = movie.id
  form.value = {
    title: movie.title || '',
    genre: (movie.genre || []).join(', '),
    language: (movie.language || []).join(', '),
    duration: movie.duration || 120,
    rating: movie.rating || 0,
    censor: movie.censor || 'UA',
    releaseDate: movie.releaseDate || new Date().toISOString().slice(0, 10),
    status: movie.status || 'now_playing',
    description: movie.description || '',
    director: movie.director || '',
    poster: movie.poster || '',
    backdrop: movie.backdrop || '',
    trending: !!movie.trending,
    topRated: !!movie.topRated
  }
  formErrors.value = {}
  dialogOpen.value = true
}

function validate() {
  const errors = {}
  if (!form.value.title.trim()) errors.title = 'Title is required'
  if (!form.value.genre.trim()) errors.genre = 'At least one genre is required'
  if (!form.value.duration || form.value.duration <= 0) errors.duration = 'Enter a valid duration'
  if (form.value.rating < 0 || form.value.rating > 5) errors.rating = 'Rating must be between 0 and 5'
  if (!form.value.releaseDate) errors.releaseDate = 'Release date is required'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      genre: form.value.genre.split(',').map((g) => g.trim()).filter(Boolean),
      language: form.value.language.split(',').map((l) => l.trim()).filter(Boolean),
      duration: Number(form.value.duration),
      rating: Number(form.value.rating),
      censor: form.value.censor,
      releaseDate: form.value.releaseDate,
      status: form.value.status,
      description: form.value.description.trim(),
      director: form.value.director.trim(),
      poster: form.value.poster.trim(),
      backdrop: form.value.backdrop.trim(),
      trending: form.value.trending,
      topRated: form.value.topRated
    }

    if (editingId.value) {
      await movies.updateMovie(editingId.value, payload)
      toast.success(`"${payload.title}" updated successfully`)
    } else {
      // Preserve existing cast list on edit; new movies start with none.
      await movies.createMovie({ ...payload, cast: [], id: 'm' + Date.now() })
      toast.success(`"${payload.title}" added to the catalogue`)
    }
    dialogOpen.value = false
  } catch (err) {
    toast.error(err.message || 'Could not save the movie. Please try again.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(movie) {
  targetToDelete.value = movie
  deleteDialogOpen.value = true
}

async function performDelete() {
  if (!targetToDelete.value) return
  deleting.value = true
  try {
    await movies.deleteMovie(targetToDelete.value.id)
    toast.success(`"${targetToDelete.value.title}" removed`)
    deleteDialogOpen.value = false
    targetToDelete.value = null
  } catch (err) {
    toast.error(err.message || 'Could not delete the movie. Please try again.')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Admin Dashboard</h2>
        <p class="text-caption text-medium-emphasis mb-0">Manage the CineNova movie catalogue</p>
      </div>
      <v-btn class="neon-btn" prepend-icon="mdi-plus" @click="openCreate">Add Movie</v-btn>
    </div>

    <v-text-field
      v-model="search"
      placeholder="Search movies by title, genre or status..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-4"
      style="max-width: 420px"
      hide-details
    />

    <!-- Loading state -->
    <div v-if="movies.loading" class="skeleton-table">
      <div v-for="n in 5" :key="n" class="skeleton skeleton-row mb-2"></div>
    </div>

    <!-- Network / server error state -->
    <div v-else-if="movies.error" class="text-center py-12">
      <v-icon size="56" color="error">mdi-cloud-off-outline</v-icon>
      <p class="text-body-1 mt-3 mb-1">Couldn't load movies</p>
      <p class="text-caption text-medium-emphasis mb-4">{{ movies.error }}</p>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="movies.fetchAll(true)">Retry</v-btn>
    </div>

    <!-- Empty state -->
    <div v-else-if="!filtered.length" class="text-center py-12">
      <v-icon size="56" color="grey-darken-1">mdi-movie-search-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">No movies match your search</p>
    </div>

    <!-- Movie table -->
    <v-table v-else class="glass-card admin-table" density="comfortable">
      <thead>
        <tr>
          <th>Poster</th>
          <th>Title</th>
          <th>Genre</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Rating</th>
          <th>Release Date</th>
          <th class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filtered" :key="m.id">
          <td>
            <v-img
              :src="resolvePoster(m.id, m.poster)"
              width="44"
              rounded="lg"
              aspect-ratio="2/3"
              cover
              @error="markPosterBroken(m.id)"
            />
          </td>
          <td class="font-weight-medium">{{ m.title }}</td>
          <td class="text-caption text-medium-emphasis">{{ m.genre?.join(', ') }}</td>
          <td>
            <v-chip size="x-small" :color="m.status === 'now_playing' ? 'success' : 'info'" variant="tonal">
              {{ m.status === 'now_playing' ? 'Now Playing' : 'Coming Soon' }}
            </v-chip>
          </td>
          <td>{{ m.duration }} min</td>
          <td>
            <v-icon size="14" color="warning">mdi-star</v-icon>
            {{ m.rating || '—' }}
          </td>
          <td class="text-caption">{{ m.releaseDate }}</td>
          <td class="text-right">
            <v-btn icon="mdi-pencil-outline" size="small" variant="text" @click="openEdit(m)" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" @click="confirmDelete(m)" />
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Add / Edit dialog -->
    <v-dialog v-model="dialogOpen" max-width="640" scrollable>
      <v-card class="glass-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ editingId ? 'Edit Movie' : 'Add Movie' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text style="max-height: 65vh">
          <v-form @submit.prevent="save">
            <v-text-field v-model="form.title" label="Title" :error-messages="formErrors.title" class="mb-2" />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.genre"
                  label="Genres (comma separated)"
                  :error-messages="formErrors.genre"
                  placeholder="Action, Adventure"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.language" label="Languages (comma separated)" placeholder="English, Hindi" />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="6" sm="3">
                <v-text-field v-model.number="form.duration" type="number" label="Duration (min)" :error-messages="formErrors.duration" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model.number="form.rating" type="number" step="0.1" label="Rating" :error-messages="formErrors.rating" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model="form.censor" label="Censor" placeholder="UA" />
              </v-col>
              <v-col cols="6" sm="3">
                <v-text-field v-model="form.releaseDate" type="date" label="Release Date" :error-messages="formErrors.releaseDate" />
              </v-col>
            </v-row>
            <v-select v-model="form.status" :items="statusOptions" label="Status" class="mb-2" />
            <v-text-field v-model="form.director" label="Director" class="mb-2" />
            <v-textarea v-model="form.description" label="Description" rows="3" class="mb-2" />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.poster" label="Poster URL" placeholder="/posters/example-poster.svg" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="form.backdrop" label="Backdrop URL" placeholder="/posters/example-backdrop.svg" />
              </v-col>
            </v-row>
            <p class="text-caption text-medium-emphasis mt-n2 mb-3">
              Leave blank or use an invalid URL to preview the automatic placeholder — broken posters are never shown to users.
            </p>
            <div class="d-flex ga-4">
              <v-checkbox v-model="form.trending" label="Trending" density="compact" hide-details />
              <v-checkbox v-model="form.topRated" label="Top Rated" density="compact" hide-details />
            </div>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn class="neon-btn" :loading="saving" @click="save">{{ editingId ? 'Save Changes' : 'Add Movie' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card class="glass-card">
        <v-card-title>Delete movie?</v-card-title>
        <v-card-text>
          Are you sure you want to remove <strong>{{ targetToDelete?.title }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.admin-table {
  border-radius: 20px;
  overflow: hidden;
}
.skeleton-row {
  height: 56px;
  border-radius: 12px;
}
</style>
