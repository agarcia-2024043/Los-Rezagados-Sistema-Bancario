using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AuthService.Api.Middlewares;
using AuthService.Application.Interfaces;
using AuthService.Application.Services;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using AuthService.Persistence.Repositories;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// ============================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

// ============================================
// CONFIGURACIÓN DE JWT
// ============================================
var jwtSettings = configuration.GetSection("Jwt");
var securitySettings = configuration.GetSection("Security");

var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key no configurada");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.FromSeconds(
                securitySettings?.GetValue<int>("ClockSkewSeconds") ?? 0
            )
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

// ============================================
// POLÍTICAS DE AUTORIZACIÓN
// ============================================
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("Cliente", policy => policy.RequireRole("Cliente"));
    options.AddPolicy("Cajero", policy => policy.RequireRole("Cajero"));
    options.AddPolicy("Auditor", policy => policy.RequireRole("Auditor"));
    options.AddPolicy("CanMakeTransactions", policy => 
        policy.RequireRole("Cliente", "Cajero", "Admin"));
    options.AddPolicy("CanViewReports", policy => 
        policy.RequireRole("Auditor", "Admin"));
});

// ============================================
// REGISTRO DE SERVICIOS Y REPOSITORIOS
// ============================================
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, Application.Services.AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// ============================================
// CONFIGURACIÓN DE CORS
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        var allowedOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? new[] { "http://localhost:4200", "http://localhost:3000" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ============================================
// CONTROLADORES Y SWAGGER
// ============================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema Bancario API",
        Version = "v1",
        Description = "API REST para sistema bancario seguro"
    });

    // Configurar JWT en Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese 'Bearer' [espacio] y luego su token"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ============================================
// BUILD APP
// ============================================
var app = builder.Build();

// ============================================
// CONFIGURACIÓN DEL PIPELINE
// ============================================

// Swagger (solo en desarrollo)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema Bancario API v1");
    });
}

// HTTPS
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}
app.UseHttpsRedirection();

// Middlewares de seguridad (ORDEN IMPORTANTE)
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();

// CORS
app.UseCors("CorsPolicy");

// Autenticación y Autorización
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Endpoint raíz
app.MapGet("/", () => new
{
    service = "Sistema Bancario API",
    version = "1.0.0",
    status = "running",
    timestamp = DateTime.UtcNow
}).AllowAnonymous();

// ============================================
// INICIALIZACIÓN DE BD
// ============================================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Verificando conexión a la base de datos...");
        
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Aplicar migraciones
        await context.Database.MigrateAsync();
        
        logger.LogInformation("✅ Base de datos inicializada correctamente");

        // Verificar roles
        var rolesCount = await context.Roles.CountAsync();
        logger.LogInformation("Roles en BD: {Count}", rolesCount);

        if (rolesCount == 0)
        {
            logger.LogWarning("⚠️ No hay roles. Ejecuta las migraciones.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Error al inicializar la base de datos");
        throw;
    }
}

// ============================================
// INICIAR SERVIDOR
// ============================================
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("🚀 Sistema Bancario API iniciando...");
logger.LogInformation("🌐 Entorno: {Environment}", app.Environment.EnvironmentName);

app.Run();

logger.LogInformation("✅ Sistema Bancario API ejecutándose");