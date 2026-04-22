import { Router, type IRouter } from "express";
import healthRouter from "./health";
import siteRouter from "./site";
import newsRouter from "./news";
import announcementsRouter from "./announcements";
import tendersRouter from "./tenders";
import competitionsRouter from "./competitions";
import gazetteRouter from "./gazette";
import projectsRouter from "./projects";
import legislationRouter from "./legislation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(siteRouter);
router.use(newsRouter);
router.use(announcementsRouter);
router.use(tendersRouter);
router.use(competitionsRouter);
router.use(gazetteRouter);
router.use(projectsRouter);
router.use(legislationRouter);

export default router;
