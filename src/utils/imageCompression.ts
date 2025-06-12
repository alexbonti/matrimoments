export const compressImage = (file: File, maxSizeKB = 300): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions to maintain aspect ratio
      let { width, height } = img
      const maxDimension = 1200

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width
        width = maxDimension
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height
        height = maxDimension
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      // Try different quality levels to achieve target size
      let quality = 0.9
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob && (blob.size <= maxSizeKB * 1024 || quality <= 0.1)) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              quality -= 0.1
              tryCompress()
            }
          },
          'image/jpeg',
          quality
        )
      }

      tryCompress()
    }

    img.src = URL.createObjectURL(file)
  })
}

export const createThumbnail = (file: File, maxSize = 300): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // Create square thumbnail
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2

      canvas.width = maxSize
      canvas.height = maxSize

      // Draw cropped and resized image
      ctx.drawImage(
        img,
        offsetX, offsetY, size, size,
        0, 0, maxSize, maxSize
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(thumbnailFile)
          }
        },
        'image/jpeg',
        0.8
      )
    }

    img.src = URL.createObjectURL(file)
  })
}