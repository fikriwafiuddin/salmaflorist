<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function addresses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function testimonials(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Testimonials::class);
    }

    public function cashTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CashTransaction::class, 'created_by');
    }

    public function batchStocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BatchStock::class, 'created_by');
    }

    public function materialStockLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MaterialStockLog::class, 'created_by');
    }

    public function statusLogChanges(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderStatusLog::class, 'changed_by');
    }
}
