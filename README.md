Game of Life
============

A JavaScript implementation of Conway's Game of Life and other cellualr automata, with support for multiple life types.
This means that there are different coloured cells in the grid, each following the same rule and growing independently.
Collision handling is implementation specific. See the working version for more info.

*A working version can be viewed [**here**](http://eternalthinker.github.io/multilife)*

*The classic implementation with single life type and more UI features is here: [**Game of Life**](http://eternalthinker.github.io/gameoflife)* 

##### Reflections
Implementation decisions in making a multi life automata is largely open. And there are a bunch of them:  
Multiple ways to choose from in deciding how to handle collisions of two life types (colours). Neighbours of only the same colour, or all colours may be considered. A colour may or may not overwrite a cell with another live colour. All the different combinations of these decisions lead to different behaviour in which the coloured cells evolve and combine, survive or go extinct.  
Due to this lack of a solid definition, the idea of a multi life implementation boils down to a subjective, fancy implementation which is theoretically not as amusing as the classic single life version.

