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
                @auth
                    @if (auth()->user()->role === 'admin')
                        <a href="{{ route('dashboard') }}" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Admin Dashboard">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                        </a>
                    @else
                        <div x-data="{ open: false }" class="relative">
                            <button @click="open = !open" class="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </button>
                            <div 
                                x-show="open" 
                                @click.away="open = false"
                                x-transition:enter="transition ease-out duration-100"
                                x-transition:enter-start="transform opacity-0 scale-95"
                                x-transition:enter-end="transform opacity-100 scale-100"
                                x-transition:leave="transition ease-in duration-75"
                                x-transition:leave-start="transform opacity-100 scale-100"
                                x-transition:leave-end="transform opacity-0 scale-95"
                                class="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50"
                                style="display: none;"
                            >
                                <a href="{{ route('user.transactions.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Transaksi Saya</a>
                                <div class="border-t my-1"></div>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </div>
                    @endif
                @else
                    <a href="{{ route('login') }}" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Login">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in size-5"><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>
                    </a>
                @endauth
                <button id="openSidebar" class="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            
            <div class="pt-4 border-t flex flex-col gap-2">
                @auth
                    @if (auth()->user()->role === 'admin')
                        <a href="{{ route('dashboard') }}" class="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                            </svg>
                            <span>Dashboard Admin</span>
                        </a>
                    @else
                        <a href="{{ route('user.transactions.index') }}" class="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                            <span>Transaksi Saya</span>
                        </a>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="flex w-full items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </form>
                    @endif
                @else
                    <a href="{{ route('login') }}" class="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in"><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>
                        <span>Login</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</div>