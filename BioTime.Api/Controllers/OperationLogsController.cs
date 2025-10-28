using BioTime.Data;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioTime.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OperationLogsController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public OperationLogsController(BioTimeDbContext context)
        {
            _context = context;
        }

        // GET: api/OperationLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OperationLog>>> GetOperationLogs()
        {
            return await _context.OperationLogs.ToListAsync();
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<OperationLog>>> GetRecentOperationLogs(
            [FromQuery] int count = 10, // Default to 10 recent logs
            [FromQuery] string? deviceSerialNumber = null)
        {
            IQueryable<OperationLog> query = _context.OperationLogs
                                                    .Include(log => log.Device); // Eager load Device

            if (!string.IsNullOrEmpty(deviceSerialNumber))
            {
                query = query.Where(log => log.Device != null && log.Device.SerialNumber == deviceSerialNumber);
            }

            return await query.OrderByDescending(log => log.Timestamp)
                              .Take(count)
                              .ToListAsync();
        }
    }
}
