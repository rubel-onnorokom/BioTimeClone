using BioTime.Data;
using BioTime.Data.Models;
using BioTime.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DevicesController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public DevicesController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Device>>> GetDevices()
        {
            return await _context.Devices.ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> CreateDevice([FromBody] Device newDevice)
        {
            if (newDevice == null || string.IsNullOrWhiteSpace(newDevice.SerialNumber))
            {
                return BadRequest("Device serial number is required.");
            }
            var device = new Device { SerialNumber = newDevice.SerialNumber, Name = newDevice.Name, IPAddress = newDevice.IPAddress, AreaId = newDevice.AreaId };
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateDevice), new { serialNumber = device.SerialNumber }, device);
        }

        [HttpPut("{serialNumber}")]
        public async Task<IActionResult> UpdateDevice(string serialNumber, [FromBody] Device updatedDevice)
        {
            var existingDevice = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (existingDevice == null)
            {
                return NotFound("Device not found.");
            }

            existingDevice.Name = updatedDevice.Name;
            existingDevice.IPAddress = updatedDevice.IPAddress;
            existingDevice.AreaId = updatedDevice.AreaId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Devices.Any(e => e.SerialNumber == serialNumber))
                {
                    return NotFound("Device not found.");
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        [HttpDelete("{serialNumber}")]
        public async Task<IActionResult> DeleteDevice(string serialNumber)
        {
            var device = await _context.Devices.FirstOrDefaultAsync(d => d.SerialNumber == serialNumber);
            if (device == null)
            {
                return NotFound("Device not found.");
            }

            _context.Devices.Remove(device);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
