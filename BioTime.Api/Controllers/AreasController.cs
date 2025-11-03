using BioTime.Data;
using BioTime.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BioTime.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AreasController : ControllerBase
    {
        private readonly BioTimeDbContext _context;

        public AreasController(BioTimeDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateArea([FromBody] Area newArea)
        {
            if (newArea == null || string.IsNullOrWhiteSpace(newArea.Name))
            {
                return BadRequest("Area name is required.");
            }
            var area = new Area { Name = newArea.Name };
            _context.Areas.Add(area);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(CreateArea), new { id = area.Id }, area);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Area>>> GetAreas()
        {
            return await _context.Areas.ToListAsync();
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateArea(int id, [FromBody] Area updatedArea)
        {
            if (id != updatedArea.Id)
            {
                return BadRequest("Area ID mismatch.");
            }

            _context.Entry(updatedArea).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Areas.Any(e => e.Id == id))
                {
                    return NotFound("Area not found.");
                }
                else
                {
                    throw;
                }
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArea(int id)
        {
            var area = await _context.Areas.FindAsync(id);
            if (area == null)
            {
                return NotFound("Area not found.");
            }

            _context.Areas.Remove(area);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
