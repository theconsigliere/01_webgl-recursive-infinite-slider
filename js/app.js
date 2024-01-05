import * as THREE from "three"
import fragment from "./shader/fragment.glsl"
import vertex from "./shader/vertex.glsl"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

// images
import img1 from "../img/1.jpg"
import img2 from "../img/2.jpg"
import img3 from "../img/3.jpg"
import img4 from "../img/4.jpg"
import img5 from "../img/5.jpg"
import img6 from "../img/6.jpg"
import img7 from "../img/7.jpg"
import img8 from "../img/8.jpg"
import img9 from "../img/9.jpg"
import img10 from "../img/10.jpg"

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene()

    this.container = options.dom
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.width, this.height)
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.outputEncoding = THREE.sRGBEncoding

    //images
    this.imgs = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10]

    //scroll
    this.scroll = 0
    this.scrollTarget = 0
    this.currentScroll = 0

    //slider
    this.sliderMargin = 1.1
    this.sliderLength = 10
    this.sliderMeshes = []
    this.sliderWidth = this.sliderMargin * this.sliderLength

    this.container.appendChild(this.renderer.domElement)

    // this.camera = new THREE.PerspectiveCamera(
    //   70,
    //   window.innerWidth / window.innerHeight,
    //   0.001,
    //   1000
    // )

    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    )

    const frustumSize = 4
    let aspect = window.innerWidth / window.innerHeight
    this.aspect = this.width / this.height
    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    )
    this.camera.position.set(0, 0, 2)

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.time = 0

    this.isPlaying = true

    // rotate camera on x axis
    // this.camera.rotation.x = 0.025
    // this.camera.rotation.y = 0.125
    // this.camera.rotation.z = 0.1

    this.addObjects()
    this.resize()
    this.initQuad()
    this.render()
    this.scrollEvent()
    this.setupResize()

    // this.settings();
  }

  settings() {
    let that = this
    this.settings = {
      progress: 0,
    }
    this.gui = new dat.GUI()
    this.gui.add(this.settings, "progress", 0, 1, 0.01)
  }

  initQuad() {
    this.sceneQuad = new THREE.Scene()
    this.materialQuad = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    this.quad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(4 * this.aspect, 4),
      this.materialQuad
    )
    this.sceneQuad.add(this.quad)
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this))
  }

  scrollEvent() {
    document.addEventListener("mousewheel", (e) => {
      this.scrollTarget = e.wheelDeltaY * 0.3
    })
  }

  resize() {
    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }

  addObjects() {
    let that = this
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: "f", value: 0 },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      // transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    })

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)

    // create slider loop

    for (let i = 0; i < this.sliderLength; i++) {
      let mesh = new THREE.Mesh(
        this.geometry,
        new THREE.MeshBasicMaterial({
          // texture
          map: new THREE.TextureLoader().load(this.imgs[i]),
        })
      )
      this.sliderMeshes.push({ mesh, index: i })
      this.scene.add(mesh)
    }
  }

  stop() {
    this.isPlaying = false
  }

  play() {
    if (!this.isPlaying) {
      this.render()
      this.isPlaying = true
    }
  }

  updateMeshes() {
    this.sliderMeshes.map((item) => {
      item.mesh.position.x =
        ((this.sliderMargin * item.index +
          this.currentScroll +
          4209 * this.sliderWidth) %
          this.sliderWidth) -
        this.sliderMargin * 2

      // console.log(item.index, item.mesh.position.x)
    })
  }

  render() {
    if (!this.isPlaying) return
    this.time += 0.05
    // slider position
    this.scroll += (this.scrollTarget - this.scroll) * 0.1
    this.scroll *= 0.9
    this.scrollTarget *= 0.9
    this.currentScroll += this.scroll * 0.01

    this.updateMeshes()
    this.material.uniforms.time.value = this.time
    requestAnimationFrame(this.render.bind(this))

    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setRenderTarget(null)
    this.renderer.render(this.sceneQuad, this.camera)
  }
}

new Sketch({
  dom: document.getElementById("container"),
})
