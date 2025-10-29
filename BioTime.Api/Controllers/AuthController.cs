using BioTime.Api.Dtos;
using BioTime.Api.Services;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BioTime.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(AdminLoginDto adminLoginDto)
        {
            var user = await _authService.GetUserByUsername(adminLoginDto.Username);
            if (user != null)
            {
                return BadRequest("Username already exists");
            }

            var createdUser = await _authService.Register(adminLoginDto);

            return Ok(new AdminUserDto { Id = createdUser.Id, Username = createdUser.Username });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AdminLoginDto adminLoginDto)
        {
            var user = await _authService.GetUserByUsername(adminLoginDto.Username);
            if (user == null)
            {
                return Unauthorized();
            }

            if (!_authService.VerifyPassword(adminLoginDto.Password, user))
            {
                return Unauthorized();
            }

            var tokens = await _authService.GenerateTokens(user);

            return Ok(tokens);
        }
    }
}
