using BioTime.Api.Dtos;
using BioTime.Data;
using BioTime.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BioTime.Api.Services
{
    public class AuthService
    {
        private readonly BioTimeDbContext _context;
        private readonly PasswordService _passwordService;
        private readonly TokenService _tokenService;

        public AuthService(BioTimeDbContext context, PasswordService passwordService, TokenService tokenService)
        {
            _context = context;
            _passwordService = passwordService;
            _tokenService = tokenService;
        }

        public async Task<AdministrativeUser> Register(AdminLoginDto adminLoginDto)
        {
            _passwordService.CreatePasswordHash(adminLoginDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var adminUser = new AdministrativeUser
            {
                Username = adminLoginDto.Username,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt
            };

            await _context.AdministrativeUsers.AddAsync(adminUser);
            await _context.SaveChangesAsync();

            return adminUser;
        }

        public async Task<AdministrativeUser> GetUserByUsername(string username)
        {
            return await _context.AdministrativeUsers.FirstOrDefaultAsync(u => u.Username == username);
        }

        public bool VerifyPassword(string password, AdministrativeUser user)
        {
            return _passwordService.VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt);
        }

        public async Task<TokenDto> GenerateTokens(AdministrativeUser user)
        {
            var accessToken = _tokenService.CreateToken(user);
            var refreshToken = _tokenService.CreateRefreshToken();

            if (refreshToken != null)
            {
                user.RefreshToken = refreshToken;
                await _context.SaveChangesAsync();
            }

            return new TokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                Username = user.Username
            };
        }

        public async Task<AdministrativeUser> GetUserById(int id)
        {
            return await _context.AdministrativeUsers.FindAsync(id);
        }

        public async Task UpdateUser(AdministrativeUser user)
        {
            _context.AdministrativeUsers.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task ChangePassword(AdministrativeUser user, string newPassword)
        {
            _passwordService.CreatePasswordHash(newPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            _context.AdministrativeUsers.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<string?> GeneratePasswordResetToken(string username)
        {
            var user = await GetUserByUsername(username);
            if (user == null) return null; // User not found

            var generatedPassword = GenerateRandomPassword();
            _passwordService.CreatePasswordHash(generatedPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            // No need for PasswordResetToken or Expiry in this flow
            await _context.SaveChangesAsync();

            return generatedPassword;
        }

        public async Task<string?> ResetPassword(string token)
        {
            var user = await _context.AdministrativeUsers.FirstOrDefaultAsync(u => u.PasswordResetToken == token && u.PasswordResetTokenExpiry > System.DateTime.UtcNow);
            if (user == null) return null; // Invalid or expired token

            var generatedPassword = GenerateRandomPassword();
            _passwordService.CreatePasswordHash(generatedPassword, out byte[] passwordHash, out byte[] passwordSalt);
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            user.PasswordResetToken = null; // Clear token after use
            user.PasswordResetTokenExpiry = null;
            await _context.SaveChangesAsync();

            return generatedPassword;
        }

        private string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
            var random = new System.Random();
            var password = new char[12]; // Generate a 12-character password

            for (int i = 0; i < password.Length; i++)
            {
                password[i] = chars[random.Next(chars.Length)];
            }

            return new string(password);
        }
    }
}
