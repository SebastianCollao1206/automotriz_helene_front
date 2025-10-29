import { Component, ChangeDetectorRef, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Validaciones } from '../../../../core/services/validaciones/validaciones';
import { NotificacionSweet } from '../../../../core/services/notificacion-sweet/notificacion-sweet';
import { CategoriaResponse } from '../../../../models/categoria';
import { MarcaResponse } from '../../../../models/marca';
import { UnidadMedidaResponse } from '../../../../models/unidad-medida';
import { TipoProductoResponse } from '../../../../models/tipo-producto';
import { CrearProductoRequest, ActualizarProductoRequest, ProductoResponse } from '../../../../models/producto';
import { finalize } from 'rxjs';
import { Producto } from '../../../../core/services/producto/producto';
import { Categoria } from '../../../../core/services/categoria/categoria';
import { Marca } from '../../../../core/services/marca/marca';
import { UnidadMedida } from '../../../../core/services/unidad-medida/unidad-medida';
import { Router } from '@angular/router';
import { TipoProducto } from '../../../../core/services/tipo-producto/tipo-producto';

@Component({
  selector: 'app-productos-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos-form.html',
  styleUrl: './productos-form.css'
})
export class ProductosForm implements OnChanges, OnInit{

  @Input() modoEdicion: boolean = false;
  @Input() productoId?: number;
  @Input() productoData?: ProductoResponse;

  @Output() alEnviarFormulario = new EventEmitter<{ request: CrearProductoRequest, imagen: File }>();
  @Output() alActualizarFormulario = new EventEmitter<{ id: number, request: ActualizarProductoRequest, imagen?: File }>();

  formularioProducto: FormGroup;
  urlImagenSeleccionada: string | null = null;
  enviandoFormulario: boolean = false;
  private archivoSeleccionado: File | null = null;

  categoriasDisponibles: CategoriaResponse[] = [];
  marcasDisponibles: MarcaResponse[] = [];
  unidadesDisponibles: UnidadMedidaResponse[] = [];
  tiposDisponibles: TipoProductoResponse[] = [];

  cargandoCategorias: boolean = false;
  cargandoMarcas: boolean = false;
  cargandoUnidades: boolean = false;
  cargandoTipos: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public validacionFormulario: Validaciones,
    private productoService: Producto,
    private categoriaService: Categoria,
    private marcaService: Marca,
    private unidadMedidaService: UnidadMedida,
    private tipoProductoService: TipoProducto,
    private router: Router
  ) {
    this.formularioProducto = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modoEdicion']) {
      this.configurarValidadores(!this.modoEdicion);
    }

    if (changes['productoData'] && this.modoEdicion && this.productoData) {
      if (this.categoriasDisponibles.length > 0 && 
          this.marcasDisponibles.length > 0 && 
          this.unidadesDisponibles.length > 0 && 
          this.tiposDisponibles.length > 0) {
        this.cargarDatosProducto();
      }
    }

    this.cdr.detectChanges();
  }

  volverAListaProductos(): void {
    this.router.navigate(['/productos']);
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      cantidadTamanio: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      descuento: [0, [Validators.min(0), Validators.max(100)]],
      categoriaId: ['', [Validators.required]],
      marcaId: ['', [Validators.required]],
      unidadMedidaId: ['', [Validators.required]],
      tipoProductoId: ['', [Validators.required]],
      imagen: ['', [Validators.required]],
      enabled: [true]
    });
  }

  private configurarValidadores(esCreacion: boolean): void {
    const imagenControl = this.formularioProducto.get('imagen');

    if (esCreacion) {
      imagenControl?.setValidators([Validators.required]);
    } else {
      imagenControl?.clearValidators();
    }

    imagenControl?.updateValueAndValidity();
  }

  private cargarDatosIniciales(): void {
    this.cargarCategorias();
    this.cargarMarcas();
    this.cargarUnidadesMedida();
    this.cargarTiposProducto();
  }

  private cargarDatosProducto(): void {
    if (!this.productoData) return;

    // Buscar los IDs correspondientes a partir de los nombres
    const categoria = this.categoriasDisponibles.find(c => c.nombre === this.productoData?.categoria);
    const marca = this.marcasDisponibles.find(m => m.nombre === this.productoData?.marca);
    const unidad = this.unidadesDisponibles.find(u => u.nombre === this.productoData?.unidadMedida);
    const tipo = this.tiposDisponibles.find(t => t.nombre === this.productoData?.tipoProducto);

    this.formularioProducto.patchValue({
      nombre: this.productoData.nombre,
      descripcion: this.productoData.descripcion,
      cantidadTamanio: this.productoData.cantidadTamanio,
      precioVenta: this.productoData.precioVenta,
      stockMinimo: this.productoData.stockMinimo,
      stock: this.productoData.stock,
      descuento: this.productoData.descuento,
      categoriaId: categoria?.id || '',
      marcaId: marca?.id || '',
      unidadMedidaId: unidad?.id || '',
      tipoProductoId: tipo?.id || '',
      enabled: this.productoData.enabled
    });

    if (this.productoData.imagen) {
      this.urlImagenSeleccionada = this.productoService.obtenerUrlImagen(this.productoData.imagen);
    }

    this.cdr.detectChanges();
  }

  cargarCategorias(): void {
    this.cargandoCategorias = true;

    this.categoriaService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoCategorias = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (categorias) => {
          this.categoriasDisponibles = categorias;
          this.verificarYCargarDatos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar categorías:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar las categorías disponibles');
          this.categoriasDisponibles = [];
        }
      });
  }

  cargarMarcas(): void {
    this.cargandoMarcas = true;

    this.marcaService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoMarcas = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (marcas) => {
          this.marcasDisponibles = marcas;
          this.verificarYCargarDatos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar marcas:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar las marcas disponibles');
          this.marcasDisponibles = [];
        }
      });
  }

  cargarUnidadesMedida(): void {
    this.cargandoUnidades = true;

    this.unidadMedidaService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoUnidades = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (unidades) => {
          this.unidadesDisponibles = unidades;
          this.verificarYCargarDatos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar unidades de medida:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar las unidades de medida disponibles');
          this.unidadesDisponibles = [];
        }
      });
  }

  cargarTiposProducto(): void {
    this.cargandoTipos = true;

    this.tipoProductoService.listarActivos()
      .pipe(finalize(() => {
        this.cargandoTipos = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (tipos) => {
          this.tiposDisponibles = tipos;
          this.verificarYCargarDatos();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar tipos de producto:', error);
          NotificacionSweet.showError('Error', 'No se pudieron cargar los tipos de producto disponibles');
          this.tiposDisponibles = [];
        }
      });
  }

  private verificarYCargarDatos(): void {
    if (this.modoEdicion && this.productoData &&
        this.categoriasDisponibles.length > 0 &&
        this.marcasDisponibles.length > 0 &&
        this.unidadesDisponibles.length > 0 &&
        this.tiposDisponibles.length > 0) {
      setTimeout(() => this.cargarDatosProducto(), 0);
    }
  }

  alSeleccionarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;

    if (archivo.size > 2 * 1024 * 1024) {
      NotificacionSweet.showWarning('Imagen muy grande', 'La imagen no debe superar los 2MB');
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      NotificacionSweet.showWarning('Archivo inválido', 'Por favor seleccione una imagen válida');
      return;
    }

    this.archivoSeleccionado = archivo;

    if (!this.modoEdicion) {
      this.formularioProducto.patchValue({ imagen: 'valid' });
      this.formularioProducto.get('imagen')?.markAsTouched();
    }

    const lector = new FileReader();
    lector.onload = (e: any) => {
      this.urlImagenSeleccionada = e.target.result;
      this.cdr.detectChanges();
    };
    lector.readAsDataURL(archivo);
  }

  eliminarImagen(): void {
    this.urlImagenSeleccionada = null;
    this.archivoSeleccionado = null;

    if (!this.modoEdicion) {
      this.formularioProducto.patchValue({ imagen: '' });
      this.formularioProducto.get('imagen')?.markAsTouched();
    }

    if (typeof document !== 'undefined') {
      const inputArchivo = document.getElementById('fileInput') as HTMLInputElement;
      if (inputArchivo) inputArchivo.value = '';
    }

    this.cdr.detectChanges();
  }

  enviarFormulario(): void {
    if (this.enviandoFormulario) return;

    Object.keys(this.formularioProducto.controls).forEach(key => {
      this.formularioProducto.get(key)?.markAsTouched();
    });

    if (this.modoEdicion) {
      this.enviarActualizacion();
    } else {
      this.enviarCreacion();
    }
  }

  private enviarCreacion(): void {
    if (!this.archivoSeleccionado) {
      NotificacionSweet.showWarning('Imagen requerida', 'Por favor seleccione una imagen del producto');
      return;
    }

    if (this.formularioProducto.invalid) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.enviandoFormulario = true;

    const request: CrearProductoRequest = {
      nombre: this.formularioProducto.get('nombre')?.value,
      descripcion: this.formularioProducto.get('descripcion')?.value,
      cantidadTamanio: this.formularioProducto.get('cantidadTamanio')?.value,
      precioVenta: this.formularioProducto.get('precioVenta')?.value,
      stockMinimo: this.formularioProducto.get('stockMinimo')?.value,
      stock: this.formularioProducto.get('stock')?.value || 0,
      descuento: this.formularioProducto.get('descuento')?.value || 0,
      categoriaId: Number(this.formularioProducto.get('categoriaId')?.value),
      marcaId: Number(this.formularioProducto.get('marcaId')?.value),
      unidadMedidaId: Number(this.formularioProducto.get('unidadMedidaId')?.value),
      tipoProductoId: Number(this.formularioProducto.get('tipoProductoId')?.value)
    };

    this.alEnviarFormulario.emit({ request, imagen: this.archivoSeleccionado });
  }

  private enviarActualizacion(): void {
    if (!this.productoId) {
      NotificacionSweet.showError('Error', 'ID de producto no disponible');
      return;
    }

    if (this.formularioProducto.invalid) {
      NotificacionSweet.showWarning('Formulario incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.enviandoFormulario = true;

    const request: ActualizarProductoRequest = {
      nombre: this.formularioProducto.get('nombre')?.value,
      descripcion: this.formularioProducto.get('descripcion')?.value,
      cantidadTamanio: this.formularioProducto.get('cantidadTamanio')?.value,
      precioVenta: this.formularioProducto.get('precioVenta')?.value,
      stockMinimo: this.formularioProducto.get('stockMinimo')?.value,
      stock: this.formularioProducto.get('stock')?.value,
      descuento: this.formularioProducto.get('descuento')?.value,
      categoriaId: Number(this.formularioProducto.get('categoriaId')?.value),
      marcaId: Number(this.formularioProducto.get('marcaId')?.value),
      unidadMedidaId: Number(this.formularioProducto.get('unidadMedidaId')?.value),
      tipoProductoId: Number(this.formularioProducto.get('tipoProductoId')?.value),
      enabled: this.formularioProducto.get('enabled')?.value
    };

    this.alActualizarFormulario.emit({
      id: this.productoId,
      request,
      imagen: this.archivoSeleccionado || undefined
    });
  }

  restablecerEstadoEnvio(): void {
    this.enviandoFormulario = false;
    this.cdr.detectChanges();
  }

  limpiarFormulario(): void {
    this.enviandoFormulario = false;

    this.formularioProducto.reset({
      nombre: '',
      descripcion: '',
      cantidadTamanio: 0,
      precioVenta: 0,
      stockMinimo: 0,
      stock: 0,
      descuento: 0,
      categoriaId: '',
      marcaId: '',
      unidadMedidaId: '',
      tipoProductoId: '',
      imagen: '',
      enabled: true
    });

    this.formularioProducto.markAsPristine();
    this.formularioProducto.markAsUntouched();

    this.urlImagenSeleccionada = null;
    this.archivoSeleccionado = null;

    if (typeof document !== 'undefined') {
      const inputArchivo = document.getElementById('fileInput') as HTMLInputElement;
      if (inputArchivo) inputArchivo.value = '';
    }

    this.cdr.detectChanges();
  }

}
