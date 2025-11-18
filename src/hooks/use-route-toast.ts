import { useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

interface RouteToastConfig {
  title: string
  description?: string
  duration?: number
}

// Queue de toasts en attente d'affichage
const toastQueue: RouteToastConfig[] = []
let isDisplaying = false

/**
 * Hook pour afficher des toasts uniquement lors des changements de route
 * Les toasts sont affichés un par un avec auto-dismiss
 */
export const useRouteToast = () => {
  const location = useLocation()
  const previousPath = useRef(location.pathname)

  useEffect(() => {
    const currentPath = location.pathname

    // Détecter le changement de route
    if (currentPath !== previousPath.current) {
      previousPath.current = currentPath
      
      // Afficher le prochain toast de la queue s'il y en a
      processToastQueue()
    }
  }, [location.pathname])

  return {
    /**
     * Ajoute un toast à la queue qui sera affiché au prochain changement de page
     */
    queueToast: (config: RouteToastConfig) => {
      toastQueue.push(config)
    },
    
    /**
     * Affiche un toast immédiatement (au prochain changement de page)
     */
    showToastOnRouteChange: (config: RouteToastConfig) => {
      toastQueue.push(config)
    },
  }
}

/**
 * Traite la queue de toasts et affiche le prochain
 */
const processToastQueue = () => {
  if (isDisplaying || toastQueue.length === 0) {
    return
  }

  isDisplaying = true
  const toastConfig = toastQueue.shift()

  if (toastConfig) {
    const duration = toastConfig.duration || 5000
    
    toast({
      title: toastConfig.title,
      description: toastConfig.description,
      duration,
    })

    // Après l'affichage du toast, traiter le suivant
    setTimeout(() => {
      isDisplaying = false
      processToastQueue()
    }, duration + 500) // Petit délai supplémentaire entre les toasts
  }
}
