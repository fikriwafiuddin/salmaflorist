@php
    $links = [
        [
            'route' => 'user.home.index',
            'label' => 'Beranda'
        ],
        [
            'route' => 'user.catalog.index',
            'label' => 'Katalog'
        ],
        [
            'route' => 'user.about.index',
            'label' => 'Tentang Kami'
        ],
        [
            'route' => 'user.testimonials.index',
            'label' => 'Testimoni'
        ],
               [
            'route' => 'user.contact.index',
            'label' => 'Kontak'
        ]
    ]
@endphp

<nav class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
    <div class="">
        <div class="p-4 flex justify-between items-center mx-auto max-w-5xl">
            <h1 class="text-primary font-playfair-display flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white">
                    <img src="/logo.png" alt="" class="size-7" />
                </div>
                <span>LLA Florist Kediri</span>
            </h1>

            <ul class="sm:flex items-center gap-6 hidden">
                @foreach ($links as $link)
                    <x-nav-link
                        href="{{ route($link['route']) }}" 
                        :active="request()->routeIs($link['route'])"
                    >
                        {{ $link['label'] }}
                    </x-nav-link>
                @endforeach
            </ul>

            <div class="flex gap-2 items-center">
                <a href="{{ route('login') }}">
                    <svg
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </a>
                <button id="openSidebar" class="sm:hidden">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</nav>

{{-- SIDEBAR MOBILE --}}
<div 
    id="mobileSidebar" 
    class="fixed inset-0 z-50 pointer-events-none"
>
    <!-- Backdrop/Overlay -->
    <div 
        id="sidebarBackdrop"
        class="absolute sm:hidden inset-0 bg-black/50 opacity-0 transition-opacity duration-300 pointer-events-none"
    ></div>
    
    <!-- Sidebar Content -->
    <div 
        id="sidebarContent"
        class="absolute sm:hidden top-0 right-0 bottom-0 w-64 bg-white shadow-2xl transform translate-x-full transition-transform duration-300 ease-out pointer-events-auto"
    >
        <button
            id="closeSidebar"
            class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-6"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                />
            </svg>
        </button>
        
        <div class="pt-16 px-6 pb-6 flex flex-col gap-6">
            @foreach ($links as $link)
                <x-nav-link
                    href="{{ route($link['route']) }}" 
                    :active="request()->routeIs($link['route'])"
                >
                    {{ $link['label'] }}
                </x-nav-link>
            @endforeach
            
            <div class="pt-4 border-t">
                @auth
                    <a href="{{ route('dashboard') }}" class="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                        <span>Keranjang</span>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                        <svg
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-6"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        <span>Login</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>