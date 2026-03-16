import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'
import { logger } from '@/services/LoggerService'

export const useBlogStore = defineStore('blog', () => {
  const posts = ref([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()

  const fetchPosts = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/blog')
      posts.value = data.map(p => ({
        id: p.id,
        title: p.title,
        date: p.publish_date || (p.created_at ? p.created_at.split('T')[0] : ''),
        status: p.status,
        views: p.views,
        content: p.content,
        image: p.image_url || p.image || '/images/default_blog.png',
        excerpt: p.excerpt || (p.content ? p.content.substring(0, 100) + '...' : '')
      }))
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      loading.value = false
    }
  }

  // Initial fetch
  fetchPosts()

  const addPost = async (post) => {
    const payload = {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      image_url: post.image,
      publish_date: post.date,
      status: post.status,
      views: 0
    }

    try {
      const { data } = await api.post('/blog', payload)
      posts.value.unshift({
        id: data.id,
        title: data.title,
        date: data.publish_date,
        status: data.status,
        views: data.views,
        content: data.content,
        image: data.image_url,
        excerpt: data.excerpt
      })
      notificationStore.addNotification("Succès", "Article ajouté", 'success')
      await logger.log('create', 'blog_posts', data.id, { title: post.title })
    } catch (error) {
      console.error('Error adding post:', error)
      notificationStore.addNotification("Erreur", "Impossible d'ajouter l'article", 'error')
      await logger.logError('create', 'blog_posts', error)
    }
  }

  const updatePost = async (id, updatedPost) => {
    const payload = {
      title: updatedPost.title,
      content: updatedPost.content,
      excerpt: updatedPost.excerpt,
      image_url: updatedPost.image,
      publish_date: updatedPost.date,
      status: updatedPost.status,
      views: updatedPost.views
    }

    try {
      await api.put(`/blog/${id}`, payload)
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) posts.value[index] = { ...updatedPost, id }
      notificationStore.addNotification("Succès", "Article mis à jour", 'success')
      await logger.log('update', 'blog_posts', id, { title: updatedPost.title })
    } catch (error) {
      console.error('Error updating post:', error)
      notificationStore.addNotification("Erreur", "Impossible de mettre à jour l'article", 'error')
      await logger.logError('update', 'blog_posts', error, { id })
    }
  }

  const deletePost = async (id) => {
    try {
      await api.delete(`/blog/${id}`)
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) posts.value.splice(index, 1)
      notificationStore.addNotification("Succès", "Article supprimé", 'success')
      await logger.log('delete', 'blog_posts', id)
    } catch (error) {
      console.error('Error deleting post:', error)
      notificationStore.addNotification("Erreur", "Impossible de supprimer l'article", 'error')
      await logger.logError('delete', 'blog_posts', error, { id })
    }
  }

  const getPostById = (id) => {
    return posts.value.find(p => p.id === id)
  }

  return { posts, loading, fetchPosts, addPost, updatePost, deletePost, getPostById }
})
