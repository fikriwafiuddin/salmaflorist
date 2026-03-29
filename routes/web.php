<?php

use App\Http\Controllers\CashTransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TestimonialsController;
use App\Http\Controllers\User\AboutController;
use App\Http\Controllers\User\CartController;
use App\Http\Controllers\User\CatalogController;
use App\Http\Controllers\User\ContactController;
use App\Http\Controllers\User\HomeController;
use App\Http\Controllers\User\OrderController as UserOrderController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Route::get('/', function () {
//     return Inertia::render('welcome', [
//         'canRegister' => Features::enabled(Features::registration()),
//     ]);
// })->name('home');

Route::get('/orders/{id}/pdf/stream', [OrderController::class, 'streamPdf'])->name('orders.pdf.stream');

Route::middleware(['auth', 'role:admin'])->prefix("/admin")->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('categories', CategoryController::class);

    Route::resource('products', ProductController::class);
    Route::get('/products/export/excel', [ProductController::class, 'exportExcel'])->name('products.export.excel');

    Route::resource('testimonials', TestimonialsController::class);

    Route::resource('materials', MaterialController::class);
    
    Route::patch('/orders/update-status/{id}', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::get('/orders/export/excel', [OrderController::class, 'exportExcel'])->name('orders.export.excel');
    Route::resource('orders', OrderController::class);
    Route::get('pos', [OrderController::class, 'pos'])->name('orders.pos');

    Route::resource('schedules', ScheduleController::class);

    Route::resource('cash-transactions', CashTransactionController::class);
    Route::get('/cash-transactions/export/excel', [CashTransactionController::class, 'exportExcel'])->name('cash-transactions.export.excel');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/product', [ReportController::class, 'product'])->name('reports.product');
    Route::get('/reports/order', [ReportController::class, 'order'])->name('reports.order');
    Route::get('/reports/cash-transaction', [ReportController::class, 'cashTransaction'])->name('reports.cashTransaction');
});

Route::name('user.')->group(function() {
    Route::get('/', [HomeController::class, 'index'])->name('home.index');
    Route::get('/catalog/{id}', [CatalogController::class, 'show'])->name('catalog.show');
    Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
    Route::get('/about', [AboutController::class, 'index'])->name('about.index');
    Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
    Route::get('/testimonials', [HomeController::class, 'testimonials'])->name('testimonials.index');

    Route::middleware(['auth', 'role:user'])->group(function () {
        Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
        Route::patch('/cart/{id}', [CartController::class, 'update'])->name('cart.update');
        Route::delete('/cart/{id}', [CartController::class, 'destroy'])->name('cart.destroy');
        Route::get('/checkout', [UserOrderController::class, 'create'])->name('checkout.index');
        Route::post('/checkout', [UserOrderController::class, 'store'])->name('checkout.store');
        Route::get('/payment', fn() => Inertia::render('user/payment/index'))->name('payment.index');
        Route::get('/payment/success', fn() => Inertia::render('user/payment/success'))->name('payment.success');
        Route::get('/transactions', fn() => Inertia::render('user/transactions/index'))->name('transactions.index');

        Route::get('/destinations/city/{provinceId}', [DestinationController::class, 'getCities'])->name('destinations.city');
        Route::get('/destinations/district/{cityId}', [DestinationController::class, 'getDistricts'])->name('destinations.district');
        Route::post('/destinations/shipping-costs', [DestinationController::class, 'getShippingCost'])->name('destinations.shipping-costs');
    });
});

require __DIR__.'/settings.php';