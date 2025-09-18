# vasdekis
Vasdekis homepage

## Preview

![Spinning Blue V Preview](https://github.com/user-attachments/assets/f0595df0-d182-494b-ba37-376d18b0bbfc)

*The WebGL-rendered blue V that spins continuously and fills the entire viewport*

## Features

- **WebGL Spinning Blue V**: A fully 3D animated blue letter "V" that continuously rotates
- **Full Screen Experience**: The V occupies the entire viewport for maximum visual impact
- **Responsive Design**: Automatically adapts to different screen sizes
- **Hardware Accelerated**: Uses WebGL for smooth 60fps animation

## Usage

Simply open `index.html` in a modern web browser that supports WebGL.

For local development, serve the files with any HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge 12+

## Technical Details

- Pure WebGL implementation using vertex and fragment shaders
- 3D matrix transformations for rotation and perspective
- Optimized triangle-based geometry for the V shape
- Automatic canvas resizing for responsive design
