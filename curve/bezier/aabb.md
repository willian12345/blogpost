You’ll need to know the function of the cubic bezier. Defined as:
f(t) = a*t^3 + b*t^2 + c*t +d
where
d = P0
c = 3*P1-3*P0
b = 3*P2-6*P1+3*P0
a = P3-3*P2+3*P1-P0

p0 and p3 are the begin and end point of the bezier, p1 & p2 the control points. This function is defined for t=[0..1] so (0, 0.00001, 0.00002, … 0.99999)






Most of this is addressed in An algorithm to find bounding box of closed bezier curves? except here we have cubic Beziers and there they were dealing with quadratic Bezier curves.

Essentially you need to take the derivatives of each of the coordinate functions. If the x-coord is given by

x = A (1-t)^3 +3 B t (1-t)^2 + 3 C t^2 (1-t) + D t^3

differentiating with respect to t.

dx/dt =  3 (B - A) (1-t)^2 + 6 (C - B) (1-t) t + 3 (D - C) t^2
      =  [3 (D - C) - 6 (C - B) + 3 (B - A)] t^2
       + [ -6 (B - A) - 6 (C - B)] t
       + 3 (B - A) 
      =  (3 D - 9 C + 9 B - 3 A) t^2 + (6 A - 12 B + 6 C) t + 3 (B - A)

this is a quadratic which we can write at a t^2 + b t + c. We want to solve dx/dt = 0 which you can do using the quadratic formula

- b +/- sqrt(b^2-4 a c)
-----------------------
        2 a

Solving this will either gives two solutions t0, t1 say, no solutions or in rare case just one solution. We are only interest in solutions with 0 <= t <= 1. You will have a maximum of four candidate points, the two end points and the two solutions. Its a simple matter to find which of these give the extreme points.

You can repeat the same process for each coordinate and then get the bounding box.

I've put this for the 2D case in a js fiddle http://jsfiddle.net/SalixAlba/QQnvm/4/
Share
Improve this answer
Follow
edited May 23, 2017 at 10:29
Community's user avatar
CommunityBot
111 silver badge
answered Jul 17, 2014 at 22:24
Salix alba's user avatar
Salix alba
7,53622 gold badges3232 silver badges3838 bronze badges

    Awesome, thanks! I noticed an instability, though, when a==0, it gives incorrect bounds, as t1 and t2 both turn out to be infinity. I fixed it with a hack that seems to work: if (a==0) a = 0.0000001; an example: jsfiddle.net/QQnvm/38 (actually a quadratic.) – 
    Jeff Ward
    Jan 12, 2017 at 15:40
    2
    That hack is kinda pointless, though. Rather than using hacks, you could just check the formula for how to handle that case. If a == 0, you can simply solve the equation b t + c = 0 which gives you t = -c / b. – 
    Stefan Fabian
    Dec 29, 2017 at 11:11

