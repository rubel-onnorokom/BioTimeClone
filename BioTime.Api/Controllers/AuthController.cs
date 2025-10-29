using BioTime.Api.Dtos;
using BioTime.Api.Services;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

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

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _authService.GetUserById(int.Parse(userId));
            if (user == null) return NotFound();

            return Ok(new AdminUserDto { Id = user.Id, Username = user.Username });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _authService.GetUserById(int.Parse(userId));
            if (user == null) return NotFound();

            if (await _authService.GetUserByUsername(updateProfileDto.Username) != null && updateProfileDto.Username != user.Username)
            {
                return BadRequest("Username already exists");
            }

            user.Username = updateProfileDto.Username;
            await _authService.UpdateUser(user);

            return Ok(new AdminUserDto { Id = user.Id, Username = user.Username });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _authService.GetUserById(int.Parse(userId));
            if (user == null) return NotFound();

            if (!_authService.VerifyPassword(changePasswordDto.CurrentPassword, user))
            {
                return BadRequest("Invalid current password");
            }

            await _authService.ChangePassword(user, changePasswordDto.NewPassword);

            return Ok("Password changed successfully");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            var generatedPassword = await _authService.GeneratePasswordResetToken(forgotPasswordDto.Username);
            if (generatedPassword == null)
            {
                // For security, always return a generic success message even if user not found
                return Ok(new { Message = "If an account with that username exists, a new password has been generated.", NewPassword = (string?)null });
            }

            return Ok(new { Message = "A new password has been generated (for testing).", NewPassword = generatedPassword });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            var generatedPassword = await _authService.ResetPassword(resetPasswordDto.Token);
            if (generatedPassword == null)
            {
                return BadRequest("Invalid or expired password reset token.");
            }

            return Ok(new { Message = "Password has been reset successfully.", NewPassword = generatedPassword });
        }
    }
}
