using FalaCidade.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace FalaCidade.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId, [FromQuery] bool onlyUnread = false)
        {
            var notifications = await _notificationService.GetByUserIdAsync(userId, onlyUnread);
            return Ok(notifications);
        }


        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var success = await _notificationService.MarkAsReadAsync(id);

            if (!success)
            {
                return NotFound(new { error = "Notificação não encontrada." });
            }

            return NoContent(); 
        }


        [HttpPatch("user/{userId}/read-all")]
        public async Task<IActionResult> MarkAllAsRead(int userId)
        {
            await _notificationService.MarkAllAsReadAsync(userId);
            return NoContent();
        }
    }
}
