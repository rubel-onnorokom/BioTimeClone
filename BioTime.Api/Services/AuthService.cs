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
                RefreshToken = refreshToken
            };
        }
    }
}
